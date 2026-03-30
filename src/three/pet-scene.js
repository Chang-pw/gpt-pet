import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

export class PetScene {
  constructor({ container, config, petState, animationController }) {
    this.container = container;
    this.config = config;
    this.petState = petState;
    this.animationController = animationController;
    this.renderer = null;
    this.scene = null;
    this.camera = null;
    this.mixer = null;
    this.petRoot = null;
    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2();
    this.clock = new THREE.Clock();
    this.usingFallbackModel = false;
    this.currentBehavior = "idle";
    this.lastInteractionAt = Date.now();
    this.petBaseY = -0.95;
    this.boundResize = () => this.handleResize();
  }

  async init() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    this.camera.position.set(0, 0, 7.4);
    this.camera.lookAt(0, -0.5, 0);

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setClearColor(0x000000, 0);
    this.container.appendChild(this.renderer.domElement);

    this.addLights();
    this.addGroundGlow();

    await this.loadPet();
    this.handleResize();
    window.addEventListener("resize", this.boundResize);
    this.renderLoop();
  }

  addLights() {
    const keyLight = new THREE.DirectionalLight(0xfff4e3, 3.2);
    keyLight.position.set(3, 5, 4);
    this.scene.add(keyLight);

    const fillLight = new THREE.HemisphereLight(0xfdeed5, 0x5f6b87, 1.4);
    this.scene.add(fillLight);

    const rimLight = new THREE.PointLight(0xff9b72, 14, 18, 2);
    rimLight.position.set(-2, 2.4, 2.8);
    this.scene.add(rimLight);
  }

  addGroundGlow() {
    const geometry = new THREE.CircleGeometry(1.32, 48);
    const material = new THREE.MeshBasicMaterial({
      color: 0xffc28a,
      transparent: true,
      opacity: 0.18,
    });
    const glow = new THREE.Mesh(geometry, material);
    glow.rotation.x = -Math.PI / 2;
    glow.position.y = -1.52;
    this.scene.add(glow);

    const halo = new THREE.Mesh(
      new THREE.RingGeometry(1.32, 1.58, 48),
      new THREE.MeshBasicMaterial({
        color: 0xffddb0,
        transparent: true,
        opacity: 0.12,
        side: THREE.DoubleSide,
      })
    );
    halo.rotation.x = -Math.PI / 2;
    halo.position.y = -1.5;
    this.scene.add(halo);
  }

  async loadPet() {
    const loader = new GLTFLoader();

    try {
      const gltf = await loader.loadAsync(this.config.modelPath);
      this.petRoot = gltf.scene;
      this.petRoot.scale.setScalar(this.config.scale);
      this.petRoot.position.set(0, 0, 0);
      this.scene.add(this.petRoot);
      this.mixer = new THREE.AnimationMixer(this.petRoot);

      const actions = new Map();
      for (const clip of gltf.animations) {
        actions.set(clip.name, this.mixer.clipAction(clip));
      }

      this.animationController.attachMixer(this.mixer, actions);
      this.framePet();
      this.animationController.play(this.config.animationMap.idle);
    } catch (error) {
      this.usingFallbackModel = true;
      this.createFallbackPet();
    }
  }

  createFallbackPet() {
    const petGroup = new THREE.Group();

    const body = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.7, 1.6, 8, 16),
      new THREE.MeshStandardMaterial({
        color: 0xf2b179,
        roughness: 0.45,
        metalness: 0.08,
      })
    );

    const belly = new THREE.Mesh(
      new THREE.SphereGeometry(0.58, 24, 24),
      new THREE.MeshStandardMaterial({
        color: 0xfff4e1,
        roughness: 0.65,
      })
    );
    belly.scale.set(0.9, 0.8, 0.66);
    belly.position.set(0, -0.12, 0.43);

    const leftEar = new THREE.Mesh(
      new THREE.ConeGeometry(0.22, 0.55, 18),
      new THREE.MeshStandardMaterial({ color: 0xd97859 })
    );
    leftEar.position.set(-0.36, 1.28, 0.05);
    leftEar.rotation.z = 0.22;

    const rightEar = leftEar.clone();
    rightEar.position.x = 0.36;
    rightEar.rotation.z = -0.22;

    const eyeGeometry = new THREE.SphereGeometry(0.08, 16, 16);
    const eyeMaterial = new THREE.MeshStandardMaterial({ color: 0x2b241d });
    const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    leftEye.position.set(-0.22, 0.45, 0.63);
    const rightEye = leftEye.clone();
    rightEye.position.x = 0.22;

    const mouth = new THREE.Mesh(
      new THREE.TorusGeometry(0.09, 0.02, 8, 16, Math.PI),
      new THREE.MeshStandardMaterial({ color: 0xad5547 })
    );
    mouth.position.set(0, 0.18, 0.68);
    mouth.rotation.z = Math.PI;

    petGroup.add(body, belly, leftEar, rightEar, leftEye, rightEye, mouth);
    petGroup.position.set(0, 0, 0);
    petGroup.scale.setScalar(this.config.scale);

    this.petRoot = petGroup;
    this.scene.add(this.petRoot);
    this.framePet();

    let time = 0;
    this.animationController.setFallbackTicker((delta) => {
      time += delta;
      const mode = this.petState.runtime.mode;
      const breathe = Math.sin(time * 2.4) * 0.035;
      const sway = Math.sin(time * 1.6) * 0.1;

      this.petRoot.scale.set(
        this.config.scale,
        this.config.scale * (1 + breathe),
        this.config.scale
      );
      this.petRoot.rotation.y = sway * 0.35;
      this.petRoot.position.y = this.petBaseY + Math.max(0, Math.sin(time * 4.2)) * 0.04;

      if (mode === "dragging") {
        this.petRoot.rotation.z = 0.12;
        this.petRoot.position.y = this.petBaseY + 0.05;
      } else if (mode === "reacting") {
        this.petRoot.rotation.z = Math.sin(time * 12) * 0.08;
      } else if (mode === "sleeping") {
        this.petRoot.rotation.z = -0.08;
        this.petRoot.position.y = this.petBaseY - 0.08;
      } else {
        this.petRoot.rotation.z = 0;
      }
    });
  }

  framePet() {
    if (!this.petRoot) return;

    const box = new THREE.Box3().setFromObject(this.petRoot);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());

    this.petRoot.position.x -= center.x;
    this.petRoot.position.z -= center.z;

    const recenteredBox = new THREE.Box3().setFromObject(this.petRoot);
    const recenteredCenter = recenteredBox.getCenter(new THREE.Vector3());
    const recenteredSize = recenteredBox.getSize(new THREE.Vector3());
    const maxDim = Math.max(recenteredSize.x, recenteredSize.y, recenteredSize.z);
    const fov = THREE.MathUtils.degToRad(this.camera.fov);
    const distance = (maxDim / (2 * Math.tan(fov / 2))) * 1.28;

    this.petBaseY = -1.18 - recenteredBox.min.y;
    this.petRoot.position.y = this.petBaseY;

    this.camera.position.set(0, recenteredCenter.y * 0.2, Math.max(distance, 4.8));
    this.camera.lookAt(0, this.petBaseY + recenteredSize.y * 0.42, 0);
  }

  renderLoop() {
    const tick = () => {
      this.updateBehavior();
      this.renderer.render(this.scene, this.camera);
      requestAnimationFrame(tick);
    };

    tick();
  }

  updateBehavior() {
    const now = Date.now();
    const elapsed = now - this.petState.runtime.lastInteractionAt;

    if (this.petState.runtime.mode === "dragging") {
      this.currentBehavior = "dragging";
      return;
    }

    if (elapsed > this.config.sleepTimeoutMs) {
      if (this.currentBehavior !== "sleeping") {
        this.forceSleep();
      }
      return;
    }

    if (elapsed > this.config.idleTimeoutMs && this.currentBehavior !== "idle") {
      this.setIdle();
    }
  }

  triggerReaction() {
    this.lastInteractionAt = Date.now();
    this.currentBehavior = "reacting";
    this.animationController.setMode("reacting");

    const reactionClips = this.config.animationMap.react;
    const clipName = reactionClips[Math.floor(Math.random() * reactionClips.length)];
    const played = this.animationController.play(clipName, { loopOnce: true });

    if (!played) {
      this.petRoot.scale.setScalar(this.config.scale * 1.04);
      setTimeout(() => {
        this.petRoot.scale.setScalar(this.config.scale);
      }, 180);
    }

    window.clearTimeout(this.reactionTimer);
    this.reactionTimer = window.setTimeout(() => {
      this.setIdle();
    }, 1200);
  }

  forceSleep() {
    this.currentBehavior = "sleeping";
    this.animationController.setMode("sleeping");
    this.animationController.play(this.config.animationMap.sleep);
  }

  setIdle() {
    this.currentBehavior = "idle";
    this.animationController.setMode("idle");
    this.animationController.play(this.config.animationMap.idle);
  }

  isPetHit(clientX, clientY) {
    if (!this.petRoot || !this.renderer || !this.camera) return false;

    const rect = this.renderer.domElement.getBoundingClientRect();
    this.pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    this.pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.pointer, this.camera);
    const hits = this.raycaster.intersectObject(this.petRoot, true);
    return hits.length > 0;
  }

  setPressed(pressed) {
    if (!this.petRoot) return;
    if (pressed) {
      this.petRoot.scale.setScalar(this.config.scale * 0.98);
    } else {
      this.petRoot.scale.setScalar(this.config.scale);
    }
  }

  handleResize() {
    const width = this.container.clientWidth || 280;
    const height = this.container.clientHeight || 320;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height, false);
  }

  dispose() {
    window.removeEventListener("resize", this.boundResize);
    window.clearTimeout(this.reactionTimer);
    this.renderer?.dispose();
  }
}
