import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

export default function NovaRobotCanvas({ scrollProgress = 0 }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(renderer.domElement);
    renderer.domElement.style.position = 'fixed';
    renderer.domElement.style.top = '0';
    renderer.domElement.style.left = '0';
    renderer.domElement.style.width = '100vw';
    renderer.domElement.style.height = '100vh';
    renderer.domElement.style.zIndex = '0';
    renderer.domElement.style.pointerEvents = 'none';

    const scene = new THREE.Scene();

    // Environment
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();
    const roomEnv = new RoomEnvironment();
    const envTexture = pmremGenerator.fromScene(roomEnv, 0.04).texture;
    scene.environment = envTexture;
    scene.environmentIntensity = 0.9;

    // Camera (30 deg FOV)
    const camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 1.1, 11.6);

    // Lights
    const hemiLight = new THREE.HemisphereLight(0xfff6ee, 0xd9d2c8, 0.7);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfff3e6, 1.7);
    keyLight.position.set(-3, 5, 4);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.radius = 6;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 18;
    keyLight.shadow.camera.left = -3.5;
    keyLight.shadow.camera.right = 3.5;
    keyLight.shadow.camera.top = 3.5;
    keyLight.shadow.camera.bottom = -3.5;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xfff0e6, 1.2);
    rimLight.position.set(4, 2, -4);
    scene.add(rimLight);

    const fillLight = new THREE.PointLight(0xff9a6a, 2.2, 6);
    fillLight.position.set(-3.2, 1.2, 0.6);
    scene.add(fillLight);

    // Conic gradient ring texture
    const ringCanvas = document.createElement('canvas');
    ringCanvas.width = 512;
    ringCanvas.height = 512;
    const rCtx = ringCanvas.getContext('2d');
    const conic = rCtx.createConicGradient(0, 256, 256);
    conic.addColorStop(0, '#ff3d8b');
    conic.addColorStop(0.18, '#ff5a5f');
    conic.addColorStop(0.34, '#ff8a3d');
    conic.addColorStop(0.50, '#ffb347');
    conic.addColorStop(0.66, '#ff8a3d');
    conic.addColorStop(0.82, '#ff5a5f');
    conic.addColorStop(1, '#ff3d8b');
    rCtx.fillStyle = conic;
    rCtx.fillRect(0, 0, 512, 512);

    const ringTexture = new THREE.CanvasTexture(ringCanvas);
    ringTexture.colorSpace = THREE.SRGBColorSpace;

    // Face screen texture
    const faceCanvas = document.createElement('canvas');
    faceCanvas.width = 512;
    faceCanvas.height = 512;
    const fCtx = faceCanvas.getContext('2d');
    const faceTexture = new THREE.CanvasTexture(faceCanvas);
    faceTexture.colorSpace = THREE.SRGBColorSpace;

    let quoteMode = false;
    let quoteAlpha = 0.0;
    let eyeBlinkProgress = 0;
    let isBlinking = false;
    let blinkStartTime = 0;
    let nextBlinkTime = performance.now() + 3000;

    function renderFace() {
      fCtx.fillStyle = '#000000';
      fCtx.fillRect(0, 0, 512, 512);

      const now = performance.now();
      if (!isBlinking && now > nextBlinkTime) {
        isBlinking = true;
        blinkStartTime = now;
      }
      if (isBlinking) {
        const elapsed = (now - blinkStartTime) / 180;
        if (elapsed >= 1) {
          isBlinking = false;
          eyeBlinkProgress = 0;
          nextBlinkTime = now + 2500 + Math.random() * 3000;
        } else {
          eyeBlinkProgress = Math.sin(elapsed * Math.PI) * 0.9;
        }
      }

      if (quoteMode && quoteAlpha < 1.0) {
        quoteAlpha = Math.min(1.0, quoteAlpha + 0.05);
      } else if (!quoteMode && quoteAlpha > 0.0) {
        quoteAlpha = Math.max(0.0, quoteAlpha - 0.05);
      }

      fCtx.save();
      fCtx.shadowColor = '#ffffff';
      fCtx.shadowBlur = 18;
      fCtx.fillStyle = '#ffffff';

      if (quoteAlpha < 1.0) {
        fCtx.globalAlpha = 1.0 - quoteAlpha;
        const scaleY = Math.max(0.1, 1.0 - eyeBlinkProgress);

        fCtx.beginPath();
        fCtx.ellipse(196, 262, 30, 38 * scaleY, 0, 0, Math.PI * 2);
        fCtx.fill();

        fCtx.beginPath();
        fCtx.ellipse(316, 252, 30, 38 * scaleY, 0, 0, Math.PI * 2);
        fCtx.fill();
      }

      if (quoteAlpha > 0.0) {
        fCtx.globalAlpha = quoteAlpha;
        fCtx.font = '900 560px "Arial Black", sans-serif';
        fCtx.textAlign = 'center';
        fCtx.textBaseline = 'alphabetic';
        fCtx.fillText('“', 256, 400);
      }

      fCtx.restore();
      faceTexture.needsUpdate = true;
    }

    // Materials
    const shellMat = new THREE.MeshPhysicalMaterial({
      color: 0xeeebe6,
      roughness: 0.38,
      clearcoat: 0.45,
      clearcoatRoughness: 0.3
    });

    const shellLightMat = new THREE.MeshPhysicalMaterial({
      color: 0xf8f6f2,
      roughness: 0.34,
      clearcoat: 0.45,
      clearcoatRoughness: 0.3
    });

    const jointsMat = new THREE.MeshStandardMaterial({
      color: 0x1b1b1f,
      roughness: 0.55,
      metalness: 0.3
    });

    const deepDarkMat = new THREE.MeshStandardMaterial({
      color: 0x0f0f12,
      roughness: 0.8
    });

    const pedestalMat = new THREE.MeshStandardMaterial({
      color: 0x2a2928,
      roughness: 0.9
    });

    const ringMat = new THREE.MeshPhysicalMaterial({
      map: ringTexture,
      emissiveMap: ringTexture,
      emissive: 0xffffff,
      emissiveIntensity: 0.22,
      roughness: 0.5,
      clearcoat: 0.35
    });

    const screenMat = new THREE.MeshPhysicalMaterial({
      color: 0x050505,
      roughness: 0.15,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05,
      emissive: 0xffffff,
      emissiveMap: faceTexture,
      emissiveIntensity: 1.6
    });

    // Robot Hierarchy
    const robot = new THREE.Group();
    scene.add(robot);

    function createRoundedRectShape(w, h, r) {
      const shape = new THREE.Shape();
      const x = -w / 2;
      const y = -h / 2;
      shape.moveTo(x + r, y);
      shape.lineTo(x + w - r, y);
      shape.quadraticCurveTo(x + w, y, x + w, y + r);
      shape.lineTo(x + w, y + h - r);
      shape.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      shape.lineTo(x + r, y + h);
      shape.quadraticCurveTo(x, y + h, x, y + h - r);
      shape.lineTo(x, y + r);
      shape.quadraticCurveTo(x, y, x + r, y);
      return shape;
    }

    function remapUVs(geom, minX, maxX, minY, maxY) {
      const pos = geom.attributes.position;
      const uvs = geom.attributes.uv;
      for (let i = 0; i < pos.count; i++) {
        const u = (pos.getX(i) - minX) / (maxX - minX);
        const v = (pos.getY(i) - minY) / (maxY - minY);
        uvs.setXY(i, u, v);
      }
      uvs.needsUpdate = true;
    }

    // Head
    const headPivot = new THREE.Group();
    headPivot.position.set(0, 0.78, 0);
    robot.add(headPivot);

    const headCenter = new THREE.Group();
    headCenter.position.set(0, 0.78, 0);
    headPivot.add(headCenter);

    const skullGeom = new RoundedBoxGeometry(1.5, 1.42, 1.3, 4, 0.2);
    const skullMesh = new THREE.Mesh(skullGeom, shellMat);
    skullMesh.castShadow = true;
    skullMesh.receiveShadow = true;
    headCenter.add(skullMesh);

    const backBlockGeom = new RoundedBoxGeometry(1.28, 1.14, 0.9, 3, 0.1);
    const backBlockMesh = new THREE.Mesh(backBlockGeom, deepDarkMat);
    backBlockMesh.position.set(0, 0, -0.28);
    backBlockMesh.castShadow = true;
    headCenter.add(backBlockMesh);

    const circuitMat = jointsMat;
    const circuitGeom = new THREE.BoxGeometry(0.04, 0.04, 0.12);
    for (let i = 0; i < 26; i++) {
      const bar = new THREE.Mesh(circuitGeom, circuitMat);
      if (i < 16) {
        bar.position.set((Math.random() - 0.5) * 1.0, (Math.random() - 0.5) * 0.9, -0.73);
      } else {
        bar.position.set((Math.random() - 0.5) * 1.0, 0.58, -0.28 + (Math.random() - 0.5) * 0.7);
        bar.rotation.x = Math.PI / 2;
      }
      headCenter.add(bar);
    }

    const outerShape = createRoundedRectShape(1.5, 1.44, 0.3);
    const innerHole = createRoundedRectShape(1.08, 1.02, 0.2);
    outerShape.holes.push(innerHole);

    const ringGeom = new THREE.ExtrudeGeometry(outerShape, {
      depth: 0.1,
      bevelEnabled: true,
      bevelSegments: 3,
      steps: 1,
      bevelSize: 0.03,
      bevelThickness: 0.03
    });
    ringGeom.center();
    remapUVs(ringGeom, -0.78, 0.78, -0.75, 0.75);

    const faceRingMesh = new THREE.Mesh(ringGeom, ringMat);
    faceRingMesh.position.set(0, 0, 0.6);
    faceRingMesh.castShadow = true;
    headCenter.add(faceRingMesh);

    const bezelOuter = createRoundedRectShape(1.12, 1.06, 0.2);
    const bezelInner = createRoundedRectShape(0.92, 0.86, 0.12);
    bezelOuter.holes.push(bezelInner);
    const bezelGeom = new THREE.ExtrudeGeometry(bezelOuter, {
      depth: 0.04,
      bevelEnabled: false
    });
    bezelGeom.center();
    const bezelMesh = new THREE.Mesh(bezelGeom, shellLightMat);
    bezelMesh.position.set(0, 0, 0.62);
    headCenter.add(bezelMesh);

    const screenGeom = new RoundedBoxGeometry(0.9, 0.84, 0.02, 3, 0.1);
    const screenMesh = new THREE.Mesh(screenGeom, screenMat);
    screenMesh.position.set(0, 0, 0.66);
    headCenter.add(screenMesh);

    const earGeom = new THREE.CylinderGeometry(0.22, 0.22, 0.16, 24);
    const earLeft = new THREE.Mesh(earGeom, shellMat);
    earLeft.rotation.z = Math.PI / 2;
    earLeft.position.set(-0.82, 0, 0);
    earLeft.castShadow = true;
    headCenter.add(earLeft);

    const earRight = new THREE.Mesh(earGeom, shellMat);
    earRight.rotation.z = Math.PI / 2;
    earRight.position.set(0.82, 0, 0);
    earRight.castShadow = true;
    headCenter.add(earRight);

    const capGeom = new THREE.CylinderGeometry(0.18, 0.18, 0.04, 24);
    const capLeft = new THREE.Mesh(capGeom, jointsMat);
    capLeft.rotation.z = Math.PI / 2;
    capLeft.position.set(-0.91, 0, 0);
    headCenter.add(capLeft);

    const capRight = new THREE.Mesh(capGeom, jointsMat);
    capRight.rotation.z = Math.PI / 2;
    capRight.position.set(0.91, 0, 0);
    headCenter.add(capRight);

    const cableGeom = new THREE.TorusGeometry(0.26, 0.035, 12, 28, Math.PI);
    const cableMesh = new THREE.Mesh(cableGeom, deepDarkMat);
    cableMesh.position.set(0.82, -0.15, 0);
    cableMesh.rotation.y = Math.PI / 2;
    cableMesh.rotation.z = -0.2;
    headCenter.add(cableMesh);

    // Neck
    const neckGeom = new THREE.CylinderGeometry(0.24, 0.24, 0.28, 20);
    const neckMesh = new THREE.Mesh(neckGeom, jointsMat);
    neckMesh.position.set(0, 0.65, 0);
    neckMesh.castShadow = true;
    robot.add(neckMesh);

    // Torso
    const torsoGroup = new THREE.Group();
    robot.add(torsoGroup);

    const torsoGeom = new RoundedBoxGeometry(1.22, 1.12, 0.92, 4, 0.24);
    const torsoMesh = new THREE.Mesh(torsoGeom, shellMat);
    torsoMesh.castShadow = true;
    torsoMesh.receiveShadow = true;
    torsoGroup.add(torsoMesh);

    const chestSlabGeom = new RoundedBoxGeometry(1.0, 0.24, 0.12, 3, 0.04);
    const chestSlab = new THREE.Mesh(chestSlabGeom, shellLightMat);
    chestSlab.position.set(0, 0.32, 0.44);
    chestSlab.castShadow = true;
    torsoGroup.add(chestSlab);

    const ledColors = [0xff8a3d, 0xff5a5f, 0xff3d8b];
    const ledGeom = new THREE.SphereGeometry(0.035, 12, 12);
    ledColors.forEach((col, idx) => {
      const ledMat = new THREE.MeshStandardMaterial({
        color: col,
        emissive: col,
        emissiveIntensity: 2.2,
        roughness: 0.2
      });
      const led = new THREE.Mesh(ledGeom, ledMat);
      led.position.set(-0.16 + idx * 0.16, 0.32, 0.51);
      torsoGroup.add(led);
    });

    const slotGeom = new RoundedBoxGeometry(0.06, 0.28, 0.04, 2, 0.02);
    [-0.22, 0.22].forEach(xPos => {
      const slot = new THREE.Mesh(slotGeom, deepDarkMat);
      slot.position.set(xPos, -0.05, 0.46);
      torsoGroup.add(slot);

      const lipGeom = new THREE.TorusGeometry(0.04, 0.016, 8, 16, Math.PI);
      const lip = new THREE.Mesh(lipGeom, deepDarkMat);
      lip.position.set(xPos, 0.10, 0.465);
      torsoGroup.add(lip);
    });

    const pelvisGeom = new RoundedBoxGeometry(0.9, 0.22, 0.7, 3, 0.06);
    const pelvisMesh = new THREE.Mesh(pelvisGeom, jointsMat);
    pelvisMesh.position.set(0, -0.58, 0);
    pelvisMesh.castShadow = true;
    torsoGroup.add(pelvisMesh);

    // Arms
    const shoulderBallGeom = new THREE.SphereGeometry(0.14, 16, 16);
    const upperArmGeom = new RoundedBoxGeometry(0.22, 0.5, 0.22, 3, 0.06);
    const elbowBallGeom = new THREE.SphereGeometry(0.11, 16, 16);
    const handGeom = new RoundedBoxGeometry(0.2, 0.32, 0.2, 3, 0.05);
    const thumbGeom = new RoundedBoxGeometry(0.06, 0.12, 0.08, 2, 0.02);

    function buildArm(isRight) {
      const arm = new THREE.Group();
      const side = isRight ? 1 : -1;
      arm.position.set(side * 0.72, 0.35, 0);

      const shoulder = new THREE.Mesh(shoulderBallGeom, jointsMat);
      shoulder.castShadow = true;
      arm.add(shoulder);

      const upper = new THREE.Mesh(upperArmGeom, shellMat);
      upper.position.set(side * 0.06, -0.26, 0);
      upper.castShadow = true;
      arm.add(upper);

      const elbow = new THREE.Mesh(elbowBallGeom, jointsMat);
      elbow.position.set(side * 0.08, -0.52, 0);
      elbow.castShadow = true;
      arm.add(elbow);

      const forearm = new THREE.Group();
      forearm.position.set(side * 0.08, -0.52, 0);
      forearm.rotation.x = -0.35;

      const hand = new THREE.Mesh(handGeom, shellLightMat);
      hand.position.set(0, -0.2, 0);
      hand.castShadow = true;
      forearm.add(hand);

      const thumb = new THREE.Mesh(thumbGeom, shellLightMat);
      thumb.position.set(side * -0.11, -0.15, 0.04);
      forearm.add(thumb);

      arm.add(forearm);
      arm.rotation.z = side * -0.16;
      return { root: arm, forearm, side };
    }

    const leftArmData = buildArm(false);
    const rightArmData = buildArm(true);
    robot.add(leftArmData.root);
    robot.add(rightArmData.root);

    // Legs
    const hipBallGeom = new THREE.SphereGeometry(0.14, 16, 16);
    const legBlockGeom = new RoundedBoxGeometry(0.34, 0.58, 0.38, 3, 0.08);
    const ankleGeom = new THREE.CylinderGeometry(0.12, 0.12, 0.14, 16);
    const footGeom = new RoundedBoxGeometry(0.42, 0.18, 0.62, 3, 0.06);

    [-0.36, 0.36].forEach(xPos => {
      const hip = new THREE.Mesh(hipBallGeom, jointsMat);
      hip.position.set(xPos, -0.68, 0);
      hip.castShadow = true;
      robot.add(hip);

      const leg = new THREE.Mesh(legBlockGeom, shellMat);
      leg.position.set(xPos, -1.02, 0);
      leg.castShadow = true;
      leg.receiveShadow = true;
      robot.add(leg);

      const ankle = new THREE.Mesh(ankleGeom, jointsMat);
      ankle.position.set(xPos, -1.34, 0);
      ankle.castShadow = true;
      robot.add(ankle);

      const foot = new THREE.Mesh(footGeom, shellLightMat);
      foot.position.set(xPos, -1.45, 0.08);
      foot.castShadow = true;
      foot.receiveShadow = true;
      robot.add(foot);
    });

    // Pedestal
    const pedestalGeom = new THREE.BoxGeometry(1.7, 1.6, 1.7);
    const pedestalMesh = new THREE.Mesh(pedestalGeom, pedestalMat);
    pedestalMesh.position.set(0, -2.22, 0);
    pedestalMesh.receiveShadow = true;
    scene.add(pedestalMesh);

    // Animation & Parallax
    let smoothedP = 0;
    let normMouseX = 0, normMouseY = 0;
    let smoothMouseX = 0, smoothMouseY = 0;

    const handleMouseMove = (e) => {
      normMouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      normMouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', handleMouseMove);

    function easeInOutCubic(x) {
      return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
    }

    function lerp(a, b, t) {
      return a + (b - a) * t;
    }

    const stateIntro = {
      camZ: 11.6, camY: 1.1, lookY: 0.55,
      bodyYaw: -0.42,
      headYaw: -0.6, headPitch: 0.16, headRoll: 0.22
    };

    const stateProduct = {
      camZ: 6.9, camY: 1.95, lookY: 1.72,
      bodyYaw: -0.2,
      headYaw: -0.06, headPitch: 0.04, headRoll: 0.0
    };

    const clock = new THREE.Clock();
    let animId;

    function animate() {
      animId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();

      const targetP = Math.min(Math.max(window.scrollY / window.innerHeight, 0), 2);
      smoothedP += (targetP - smoothedP) * 0.08;

      smoothMouseX += (normMouseX - smoothMouseX) * 0.06;
      smoothMouseY += (normMouseY - smoothMouseY) * 0.06;

      quoteMode = (smoothedP > 1.55);

      let blendT = smoothedP <= 1.0 ? easeInOutCubic(smoothedP) : 1.0;

      let curCamZ = lerp(stateIntro.camZ, stateProduct.camZ, blendT);
      let curCamY = lerp(stateIntro.camY, stateProduct.camY, blendT);
      let curLookY = lerp(stateIntro.lookY, stateProduct.lookY, blendT);
      let curBodyYaw = lerp(stateIntro.bodyYaw, stateProduct.bodyYaw, blendT);
      let curHeadYaw = lerp(stateIntro.headYaw, stateProduct.headYaw, blendT);
      let curHeadPitch = lerp(stateIntro.headPitch, stateProduct.headPitch, blendT);
      let curHeadRoll = lerp(stateIntro.headRoll, stateProduct.headRoll, blendT);

      if (window.innerWidth <= 900) {
        curCamZ *= 1.25;
      }

      const camOffsetX = smoothMouseX * 0.25;
      const camOffsetY = -smoothMouseY * 0.1;
      const ptrBodyYaw = smoothMouseX * 0.12;
      const ptrHeadYaw = smoothMouseX * 0.45;
      const ptrHeadPitch = smoothMouseY * 0.18;

      const idleBob = Math.sin(1.4 * time) * 0.02;
      const idleHeadPitch = Math.sin(0.9 * time) * 0.02;
      const idleHeadRoll = Math.sin(0.7 * time) * 0.02;

      robot.position.y = idleBob;
      robot.rotation.y = curBodyYaw + ptrBodyYaw;

      headPivot.rotation.y = curHeadYaw + ptrHeadYaw;
      headPivot.rotation.x = curHeadPitch + ptrHeadPitch + idleHeadPitch;
      headPivot.rotation.z = curHeadRoll + idleHeadRoll;

      const leftArmSwing = Math.sin(1.4 * time + -1) * 0.05;
      const rightArmSwing = Math.sin(1.4 * time + 1) * 0.05;
      leftArmData.root.rotation.x = leftArmSwing;
      leftArmData.forearm.rotation.x = -0.35 + leftArmSwing * 1.2;
      rightArmData.root.rotation.x = rightArmSwing;
      rightArmData.forearm.rotation.x = -0.35 + rightArmSwing * 1.2;

      camera.position.x = camOffsetX;
      camera.position.y = curCamY + camOffsetY;
      camera.position.z = curCamZ;
      camera.lookAt(0, curLookY, 0);

      renderFace();
      renderer.render(scene, camera);
    }

    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return <div ref={containerRef} className="nova-3d-canvas-container" aria-hidden="true" />;
}
