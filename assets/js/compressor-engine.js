/**
 * ============================================================================
 * High-Fidelity 3D Turbomachinery & Axial Compressor Digital Twin Engine
 * FluidMind // Mohammadamin Sharif - Mechanical Engineering (IUST & Babol Noshirvani)
 * 
 * Features:
 * - Real-time 60FPS Three.js WebGL 3D multi-stage axial compressor assembly
 * - 4 Stages of rotating titanium cambered & twisted aerofoil blades (NACA 65 series)
 * - Central drive shaft, aerodynamic spinner nose cone with dynamic aviation spiral
 * - Stationary inter-stage stator vane cascades & inlet guide vanes (IGVs)
 * - Titanium cutaway outer nacelle showing internal rotating blade channels
 * - 3D CFD compressible fluid particle streamlines (Intake -> Compression -> Discharge)
 * - Supersonic Mach cone shockwaves during Turbo Boost (24,000 RPM)
 * - Interactive 360° mouse / touch orbit drag with physical inertia & auto-drift
 * - 3 One-click camera presets: Isometric 3D, Longitudinal Cutaway, Front Intake
 * - 4 Visualization modes: CFD Aerodynamics, von Mises Stress, Thermal Map, CAD Wireframe
 * - Realistic Web Audio API jet engine turbine spool-up synthesizer
 * - Digital twin telemetry: RPM, Pressure Ratio (Πc), Mass Flow (Ṁ), Exit Temp (T₂)
 * - Graceful 2D Canvas mechanical cross-section fallback if WebGL is unavailable
 * ============================================================================
 */

(function () {
  'use strict';

  // --- Engine State ---
  const state = {
    isRunning: true,
    isBoosted: false,
    isAudioActive: false,
    throttle: 75,              // 0% - 100%
    rpm: 18450,
    targetRpm: 18450,
    maxRpm: 24000,
    idleRpm: 5200,
    angle: 0,
    viewMode: 'cfd',           // 'cfd' | 'mechanical' | 'thermal' | 'cad'
    modes: ['cfd', 'mechanical', 'thermal', 'cad'],
    modeIndex: 0,
    modeLabels: {
      cfd: 'جریان CFD',
      mechanical: 'مکانیکی & تنش',
      thermal: 'گرادیان حرارتی',
      cad: 'اسکن CAD'
    },
    audioCtx: null,
    audioGain: null,
    whineOsc: null,
    rumbleOsc: null,
    noiseNode: null,
    noiseFilter: null,
    lastFrameTime: performance.now(),
    inViewport: true,
    useWebGL: false,

    // Orbit / Camera Controls
    isDragging: false,
    dragStartX: 0,
    dragStartY: 0,
    rotX: 0.38,                // Vertical tilt
    rotY: 0.72,                // Horizontal azimuth
    velX: 0,
    velY: 0,
    targetRotX: 0.38,
    targetRotY: 0.72,
    zoomDist: 10.5,
    targetZoomDist: 10.5,
    cameraPreset: 'iso',       // 'iso' | 'cutaway' | 'front'
    hasInteracted: false
  };

  // --- DOM Elements Cache ---
  let stageEl, canvas, imgEl, hintBadge;
  let statusLabelEl, rpmDisplayEl, prDisplayEl, flowDisplayEl, tempDisplayEl;
  let powerBtn, powerText, boostBtn, modeBtn, modeText, soundBtn, soundText, soundIcon;
  let throttleInput, throttlePercentEl;
  let camBtnIso, camBtnCutaway, camBtnFront;

  // --- Three.js WebGL Variables ---
  let renderer, scene, camera;
  let rotorGroup, statorGroup, casingGroup, particlesMesh, particlesData = [];
  let bladeMaterials = {};
  let shockwaveRings = [];

  // Track Theme (Dark / Light)
  let isDarkMode = true;

  function updateThemeState() {
    isDarkMode = document.documentElement.classList.contains('dark-mode') ||
                 document.body.classList.contains('dark-mode') ||
                 !document.body.classList.contains('light-mode');
  }

  // --- Initialize Web Audio API Jet Engine Synthesizer ---
  function initAudio() {
    if (state.audioCtx) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      state.audioCtx = new AudioCtx();

      // Master Gain
      state.audioGain = state.audioCtx.createGain();
      state.audioGain.gain.setValueAtTime(0.0001, state.audioCtx.currentTime);
      state.audioGain.connect(state.audioCtx.destination);

      // 1. Blade-Pass High-Pitch Whine
      state.whineOsc = state.audioCtx.createOscillator();
      state.whineOsc.type = 'sine';
      state.whineOsc.frequency.setValueAtTime(750, state.audioCtx.currentTime);

      const whineGain = state.audioCtx.createGain();
      whineGain.gain.setValueAtTime(0.14, state.audioCtx.currentTime);
      state.whineOsc.connect(whineGain);
      whineGain.connect(state.audioGain);
      state.whineOsc.start();

      // 2. Shaft Low-Frequency Rumble
      state.rumbleOsc = state.audioCtx.createOscillator();
      state.rumbleOsc.type = 'triangle';
      state.rumbleOsc.frequency.setValueAtTime(60, state.audioCtx.currentTime);

      const rumbleFilter = state.audioCtx.createBiquadFilter();
      rumbleFilter.type = 'lowpass';
      rumbleFilter.frequency.setValueAtTime(130, state.audioCtx.currentTime);

      const rumbleGain = state.audioCtx.createGain();
      rumbleGain.gain.setValueAtTime(0.18, state.audioCtx.currentTime);
      state.rumbleOsc.connect(rumbleFilter);
      rumbleFilter.connect(rumbleGain);
      rumbleGain.connect(state.audioGain);
      state.rumbleOsc.start();

      // 3. Turbulent Airflow Roar
      const bufferSize = state.audioCtx.sampleRate * 2;
      const noiseBuffer = state.audioCtx.createBuffer(1, bufferSize, state.audioCtx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
        b6 = white * 0.115926;
      }

      state.noiseNode = state.audioCtx.createBufferSource();
      state.noiseNode.buffer = noiseBuffer;
      state.noiseNode.loop = true;

      state.noiseFilter = state.audioCtx.createBiquadFilter();
      state.noiseFilter.type = 'bandpass';
      state.noiseFilter.frequency.setValueAtTime(1100, state.audioCtx.currentTime);
      state.noiseFilter.Q.setValueAtTime(1.5, state.audioCtx.currentTime);

      const noiseGain = state.audioCtx.createGain();
      noiseGain.gain.setValueAtTime(0.24, state.audioCtx.currentTime);

      state.noiseNode.connect(state.noiseFilter);
      state.noiseFilter.connect(noiseGain);
      noiseGain.connect(state.audioGain);
      state.noiseNode.start();

    } catch (err) {
      console.warn('Web Audio initialization error:', err);
    }
  }

  function updateAudioParams() {
    if (!state.audioCtx || !state.isAudioActive) return;
    const now = state.audioCtx.currentTime;
    const rpmFrac = Math.max(0, Math.min(1, state.rpm / state.maxRpm));

    if (state.rpm < 200 || !state.isRunning) {
      state.audioGain.gain.setTargetAtTime(0.0001, now, 0.2);
      return;
    }

    const targetGain = 0.22 * (0.35 + 0.65 * rpmFrac);
    state.audioGain.gain.setTargetAtTime(targetGain, now, 0.08);

    if (state.whineOsc) {
      const whineFreq = 420 + rpmFrac * 1480;
      state.whineOsc.frequency.setTargetAtTime(whineFreq, now, 0.06);
    }
    if (state.rumbleOsc) {
      const rumbleFreq = 38 + rpmFrac * 68;
      state.rumbleOsc.frequency.setTargetAtTime(rumbleFreq, now, 0.06);
    }
    if (state.noiseFilter) {
      const filterFreq = 750 + rpmFrac * 2200;
      state.noiseFilter.frequency.setTargetAtTime(filterFreq, now, 0.06);
    }
  }

  // --- Dynamic Digital Twin Telemetry ---
  function updateTelemetry(jitter) {
    if (!statusLabelEl || !rpmDisplayEl) return;

    const displayRpm = Math.max(0, Math.round(state.rpm + (state.rpm > 500 ? jitter : 0)));
    rpmDisplayEl.textContent = displayRpm.toLocaleString('en-US') + ' RPM';

    const frac = state.rpm / state.maxRpm;
    // Pressure ratio: Pi_c = 1 + frac^2.3 * 21.5
    const pr = state.rpm > 300 ? (1.0 + Math.pow(frac, 2.3) * 21.5).toFixed(1) : '1.0';
    if (prDisplayEl) prDisplayEl.textContent = pr + ':1';

    // Mass flow: Ṁ = frac * 62.4 kg/s
    const flow = state.rpm > 300 ? (frac * 62.4).toFixed(1) : '0.0';
    if (flowDisplayEl) flowDisplayEl.textContent = flow + ' kg/s';

    // Discharge temp: T_2 = 24 + frac^1.8 * 440 °C
    const temp = state.rpm > 300 ? Math.round(24 + Math.pow(frac, 1.8) * 440) : 24;
    if (tempDisplayEl) tempDisplayEl.textContent = temp + '°C';

    if (stageEl) {
      if (state.isRunning && state.rpm > 1000) {
        stageEl.classList.add('running');
        stageEl.setAttribute('data-state', state.isBoosted ? 'boosted' : 'running');
        if (statusLabelEl) statusLabelEl.textContent = state.isBoosted ? 'توربو بوست فعال' : 'کمپرسور فعال';
      } else {
        stageEl.classList.remove('running');
        stageEl.setAttribute('data-state', 'stopped');
        if (statusLabelEl) statusLabelEl.textContent = 'خاموش / آماده';
      }
    }
  }

  // ==========================================================================
  // THREE.JS 3D WEBGL ENGINE IMPLEMENTATION
  // ==========================================================================

  function initThreeEngine() {
    if (!window.THREE) return false;

    try {
      const width = canvas.clientWidth || 480;
      const height = canvas.clientHeight || 275;

      // 1. WebGL Renderer
      renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance'
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(width, height, false);
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.15;

      // 2. Scene & Camera
      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
      updateCameraPosition();

      // 3. Lighting System
      const ambientLight = new THREE.AmbientLight(0x182c3c, 1.4);
      scene.add(ambientLight);

      const sunLight = new THREE.DirectionalLight(0xffffff, 2.0);
      sunLight.position.set(12, 16, 14);
      scene.add(sunLight);

      const rimLight = new THREE.DirectionalLight(0x00e5ff, 1.6);
      rimLight.position.set(-15, -8, -10);
      scene.add(rimLight);

      const coreGlow = new THREE.PointLight(0x00ff9c, 1.5, 22);
      coreGlow.position.set(0, 0, 3.5);
      scene.add(coreGlow);

      // 4. Materials Library
      bladeMaterials = {
        cfd: new THREE.MeshStandardMaterial({
          color: 0xa8b8c8,
          metalness: 0.88,
          roughness: 0.22,
          envMapIntensity: 1.0
        }),
        mechanical: new THREE.MeshStandardMaterial({
          color: 0x00e5ff,
          metalness: 0.5,
          roughness: 0.35,
          emissive: 0x0284c7,
          emissiveIntensity: 0.3
        }),
        thermal: new THREE.MeshStandardMaterial({
          color: 0xf59e0b,
          metalness: 0.4,
          roughness: 0.4,
          emissive: 0xd97706,
          emissiveIntensity: 0.35
        }),
        cad: new THREE.MeshStandardMaterial({
          color: 0x00e5ff,
          wireframe: true,
          wireframeLinewidth: 1.5,
          transparent: true,
          opacity: 0.85
        })
      };

      // 5. Construct 3D Turbomachine Groups
      rotorGroup = new THREE.Group();
      statorGroup = new THREE.Group();
      casingGroup = new THREE.Group();

      scene.add(rotorGroup);
      scene.add(statorGroup);
      scene.add(casingGroup);

      buildRotorAssembly();
      buildStatorAssembly();
      buildCutawayCasing();
      buildCfdParticles();
      buildShockwavePulses();

      state.useWebGL = true;
      return true;

    } catch (err) {
      console.warn('Three.js initialization failed, falling back to 2D canvas:', err);
      state.useWebGL = false;
      return false;
    }
  }

  // --- Aerodynamic Cambered Airfoil Blade Generator ---
  function createAirfoilBladeGeometry(rHub, rTip, chordRoot, chordTip, staggerDeg) {
    const geom = new THREE.BufferGeometry();
    const pos = [];
    const norm = [];
    const uvs = [];
    const indices = [];

    const spanSteps = 8;
    const chordSteps = 10;
    const staggerRad = (staggerDeg * Math.PI) / 180;

    for (let s = 0; s <= spanSteps; s++) {
      const spanFrac = s / spanSteps;
      const r = rHub + (rTip - rHub) * spanFrac;
      const chord = chordRoot + (chordTip - chordRoot) * spanFrac;
      // Aerodynamic twist: pitch angle decreases toward tip for free-vortex equilibrium
      const localStagger = staggerRad * (1.18 - 0.28 * spanFrac);
      const tMax = chord * 0.12 * (1.0 - 0.25 * spanFrac);

      for (let c = 0; c <= chordSteps; c++) {
        const chordFrac = c / chordSteps;
        const xc = (chordFrac - 0.5) * chord;
        // NACA circular arc camber curve
        const camber = 0.08 * chord * Math.sin(chordFrac * Math.PI);
        const yt = tMax * Math.sin(chordFrac * Math.PI);

        // Suction surface coordinate
        const lx = xc * Math.cos(localStagger) - (camber + yt * 0.5) * Math.sin(localStagger);
        const lz = xc * Math.sin(localStagger) + (camber + yt * 0.5) * Math.cos(localStagger);
        const ly = r;

        pos.push(lx, ly, lz);
        uvs.push(chordFrac, spanFrac);
      }
    }

    for (let s = 0; s < spanSteps; s++) {
      for (let c = 0; c < chordSteps; c++) {
        const a = s * (chordSteps + 1) + c;
        const b = (s + 1) * (chordSteps + 1) + c;
        const d = s * (chordSteps + 1) + (c + 1);
        const e = (s + 1) * (chordSteps + 1) + (c + 1);

        indices.push(a, b, d);
        indices.push(b, e, d);
        // Double-sided faces
        indices.push(a, d, b);
        indices.push(b, d, e);
      }
    }

    geom.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    geom.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geom.setIndex(indices);
    geom.computeVertexNormals();
    return geom;
  }

  // --- Build Multi-Stage Rotor Assembly ---
  function buildRotorAssembly() {
    const shaftMat = new THREE.MeshStandardMaterial({
      color: 0x22323e,
      metalness: 0.95,
      roughness: 0.18
    });

    const discMat = new THREE.MeshStandardMaterial({
      color: 0x334455,
      metalness: 0.9,
      roughness: 0.25
    });

    // 1. Central Drive Shaft (oriented along Z-axis)
    const shaftGeom = new THREE.CylinderGeometry(0.55, 0.55, 9.4, 32);
    shaftGeom.rotateX(Math.PI * 0.5);
    const shaft = new THREE.Mesh(shaftGeom, shaftMat);
    shaft.position.z = -0.3;
    rotorGroup.add(shaft);

    // 2. Spinner Nose Cone (Front Intake)
    const noseGeom = new THREE.ConeGeometry(1.4, 2.0, 32);
    noseGeom.rotateX(Math.PI * 0.5);
    const noseMat = new THREE.MeshStandardMaterial({
      color: 0x0f1d28,
      metalness: 0.92,
      roughness: 0.12
    });
    const noseCone = new THREE.Mesh(noseGeom, noseMat);
    noseCone.position.z = 4.2;
    rotorGroup.add(noseCone);

    // 3. Aviation Swirl Spiral on Nose Cone
    const spiralCurvePoints = [];
    const spiralTurns = 2.4;
    const spiralSteps = 45;
    for (let i = 0; i <= spiralSteps; i++) {
      const t = i / spiralSteps;
      const angle = t * Math.PI * 2 * spiralTurns;
      const rad = 1.35 * (1.0 - t * 0.9);
      const z = 3.2 + t * 1.8;
      spiralCurvePoints.push(new THREE.Vector3(Math.cos(angle) * rad, Math.sin(angle) * rad, z));
    }
    const spiralGeom = new THREE.BufferGeometry().setFromPoints(spiralCurvePoints);
    const spiralMat = new THREE.LineBasicMaterial({ color: 0x00ffcc, linewidth: 3 });
    const spiralLine = new THREE.Line(spiralGeom, spiralMat);
    rotorGroup.add(spiralLine);

    // 4. Rotor Stages (Stage 1 to 4 with decreasing tip radius & increasing hub radius)
    const stages = [
      { z: 2.3, rHub: 1.45, rTip: 4.3, chordRoot: 0.72, chordTip: 0.44, stagger: 32, count: 20 },
      { z: 0.6, rHub: 1.65, rTip: 3.8, chordRoot: 0.64, chordTip: 0.38, stagger: 38, count: 24 },
      { z: -1.1, rHub: 1.85, rTip: 3.3, chordRoot: 0.56, chordTip: 0.34, stagger: 44, count: 28 },
      { z: -2.8, rHub: 2.05, rTip: 2.85, chordRoot: 0.50, chordTip: 0.30, stagger: 50, count: 32 }
    ];

    stages.forEach((stg, stgIdx) => {
      // Rotor Hub Disc
      const discGeom = new THREE.CylinderGeometry(stg.rHub, stg.rHub, 0.48, 32);
      discGeom.rotateX(Math.PI * 0.5);
      const disc = new THREE.Mesh(discGeom, discMat);
      disc.position.z = stg.z;
      rotorGroup.add(disc);

      // Hub Locking Ring with Hex Bolts Detail
      const boltRingGeom = new THREE.TorusGeometry(stg.rHub * 0.88, 0.04, 8, 24);
      const boltRing = new THREE.Mesh(boltRingGeom, shaftMat);
      boltRing.position.z = stg.z + 0.25;
      rotorGroup.add(boltRing);

      // Instanced Mesh for Aerofoil Blades
      const bladeGeom = createAirfoilBladeGeometry(stg.rHub, stg.rTip, stg.chordRoot, stg.chordTip, stg.stagger);
      const instMesh = new THREE.InstancedMesh(bladeGeom, bladeMaterials[state.viewMode], stg.count);
      instMesh.name = `rotorStage_${stgIdx}`;

      const dummy = new THREE.Object3D();
      for (let i = 0; i < stg.count; i++) {
        const bladeAngle = (i / stg.count) * Math.PI * 2;
        dummy.position.set(0, 0, stg.z);
        dummy.rotation.set(0, 0, bladeAngle);
        dummy.updateMatrix();
        instMesh.setMatrixAt(i, dummy.matrix);
      }
      instMesh.instanceMatrix.needsUpdate = true;
      rotorGroup.add(instMesh);
    });
  }

  // --- Build Stationary Stator Vanes Assembly ---
  function buildStatorAssembly() {
    const statorMat = new THREE.MeshStandardMaterial({
      color: 0x475569,
      metalness: 0.7,
      roughness: 0.35
    });

    const stators = [
      { z: 3.2, rHub: 1.48, rTip: 4.35, chord: 0.48, stagger: -28, count: 18 }, // Inlet Guide Vanes (IGV)
      { z: 1.5, rHub: 1.58, rTip: 4.05, chord: 0.44, stagger: -34, count: 22 }, // Stator 1
      { z: -0.2, rHub: 1.78, rTip: 3.55, chord: 0.40, stagger: -40, count: 26 }, // Stator 2
      { z: -1.9, rHub: 1.98, rTip: 3.05, chord: 0.36, stagger: -46, count: 30 }  // Stator 3 (Exit Diffuser)
    ];

    stators.forEach((st, stIdx) => {
      const bladeGeom = createAirfoilBladeGeometry(st.rHub, st.rTip, st.chord, st.chord * 0.7, st.stagger);
      const instMesh = new THREE.InstancedMesh(bladeGeom, statorMat, st.count);
      instMesh.name = `statorStage_${stIdx}`;

      const dummy = new THREE.Object3D();
      for (let i = 0; i < st.count; i++) {
        const bladeAngle = (i / st.count) * Math.PI * 2;
        dummy.position.set(0, 0, st.z);
        dummy.rotation.set(0, 0, bladeAngle);
        dummy.updateMatrix();
        instMesh.setMatrixAt(i, dummy.matrix);
      }
      instMesh.instanceMatrix.needsUpdate = true;
      statorGroup.add(instMesh);
    });
  }

  // --- Build Aerospace Cutaway Outer Casing ---
  function buildCutawayCasing() {
    // 1. Cutaway Shroud Cylinder (revealing 160° internal window)
    const cutawayGeom = new THREE.CylinderGeometry(
      3.2, 4.45, 7.8, 36, 1, true,
      Math.PI * 0.35, Math.PI * 1.3
    );
    cutawayGeom.rotateX(Math.PI * 0.5);

    const casingMat = new THREE.MeshStandardMaterial({
      color: 0x162330,
      metalness: 0.85,
      roughness: 0.28,
      side: THREE.DoubleSide
    });
    const casingMesh = new THREE.Mesh(cutawayGeom, casingMat);
    casingMesh.position.z = 0.2;
    casingGroup.add(casingMesh);

    // 2. Front Intake Cowl Bellmouth Lip
    const lipGeom = new THREE.TorusGeometry(4.45, 0.18, 16, 48);
    const lipMat = new THREE.MeshStandardMaterial({
      color: 0x00e5ff,
      metalness: 0.9,
      roughness: 0.15
    });
    const lipMesh = new THREE.Mesh(lipGeom, lipMat);
    lipMesh.position.z = 4.1;
    casingGroup.add(lipMesh);

    // 3. Rear Exhaust Flange
    const rearFlangeGeom = new THREE.TorusGeometry(3.2, 0.16, 16, 48);
    const rearFlange = new THREE.Mesh(rearFlangeGeom, lipMat);
    rearFlange.position.z = -3.7;
    casingGroup.add(rearFlange);

    // 4. Translucent Aerodynamic Flow Shroud
    const glassGeom = new THREE.CylinderGeometry(
      3.22, 4.47, 7.8, 36, 1, true,
      Math.PI * 1.65, Math.PI * 0.7
    );
    glassGeom.rotateX(Math.PI * 0.5);
    const glassMat = new THREE.MeshStandardMaterial({
      color: 0x00e5ff,
      metalness: 0.2,
      roughness: 0.1,
      transparent: true,
      opacity: 0.18,
      side: THREE.DoubleSide
    });
    const glassMesh = new THREE.Mesh(glassGeom, glassMat);
    glassMesh.position.z = 0.2;
    casingGroup.add(glassMesh);
  }

  // --- Build 3D CFD Fluid Particle Streamlines ---
  const CFD_COUNT = 150;

  function buildCfdParticles() {
    const pos = new Float32Array(CFD_COUNT * 3);
    const col = new Float32Array(CFD_COUNT * 3);
    particlesData = [];

    for (let i = 0; i < CFD_COUNT; i++) {
      const progress = Math.random();
      const z = 5.2 - progress * 9.5;
      const progressFrac = Math.max(0, Math.min(1, (5.2 - z) / 9.5));
      const rad = (4.2 - progressFrac * 1.8) * (0.6 + Math.random() * 0.4);
      const angle = Math.random() * Math.PI * 2;

      pos[i * 3] = Math.cos(angle) * rad;
      pos[i * 3 + 1] = Math.sin(angle) * rad;
      pos[i * 3 + 2] = z;

      // Color: blue intake -> green mid -> hot amber exhaust
      const rgb = computeCfdColor(progressFrac);
      col[i * 3] = rgb.r;
      col[i * 3 + 1] = rgb.g;
      col[i * 3 + 2] = rgb.b;

      particlesData.push({
        angle: angle,
        baseRad: rad,
        progress: progress,
        speed: 1.2 + Math.random() * 1.8,
        swirlRate: 1.5 + Math.random() * 2.0
      });
    }

    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geom.setAttribute('color', new THREE.BufferAttribute(col, 3));

    const pMat = new THREE.PointsMaterial({
      size: 0.18,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending
    });

    particlesMesh = new THREE.Points(geom, pMat);
    scene.add(particlesMesh);
  }

  function computeCfdColor(progress) {
    if (state.viewMode === 'thermal') {
      return {
        r: 0.1 + progress * 0.9,
        g: Math.max(0.1, 0.8 - progress * 0.5),
        b: Math.max(0.05, 1.0 - progress * 0.9)
      };
    } else if (state.viewMode === 'mechanical') {
      return { r: 0.0, g: 0.9, b: 0.6 + progress * 0.4 };
    }
    // Standard CFD: Ice Blue -> Cyan -> Emerald -> Compressed Orange
    if (progress < 0.45) {
      return { r: 0.0, g: 0.85 + progress * 0.3, b: 1.0 };
    } else if (progress < 0.8) {
      return { r: (progress - 0.45) * 2.2, g: 1.0, b: 0.4 };
    } else {
      return { r: 1.0, g: 0.6 - (progress - 0.8) * 1.5, b: 0.1 };
    }
  }

  function updateCfdParticles(dt, rpmFrac) {
    if (!particlesMesh) return;
    const pos = particlesMesh.geometry.attributes.position.array;
    const col = particlesMesh.geometry.attributes.color.array;

    for (let i = 0; i < CFD_COUNT; i++) {
      const p = particlesData[i];
      const speed = p.speed * (0.35 + rpmFrac * 2.8);
      p.progress += (speed * dt) * 0.18;

      if (p.progress > 1.0) {
        p.progress = 0;
        p.angle = Math.random() * Math.PI * 2;
      }

      const z = 5.2 - p.progress * 9.5;
      const progressFrac = p.progress;

      // Swirl around axis as particles hit the rotor blades
      p.angle += (p.swirlRate * rpmFrac * dt) * 2.5;

      // Radial compression inward
      const currentRad = (4.2 - progressFrac * 1.8) * (0.65 + 0.35 * Math.sin(p.angle * 2));

      pos[i * 3] = Math.cos(p.angle) * currentRad;
      pos[i * 3 + 1] = Math.sin(p.angle) * currentRad;
      pos[i * 3 + 2] = z;

      const rgb = computeCfdColor(progressFrac);
      col[i * 3] = rgb.r;
      col[i * 3 + 1] = rgb.g;
      col[i * 3 + 2] = rgb.b;
    }

    particlesMesh.geometry.attributes.position.needsUpdate = true;
    particlesMesh.geometry.attributes.color.needsUpdate = true;
  }

  // --- Build Supersonic Shockwave Condensation Rings ---
  function buildShockwavePulses() {
    shockwaveRings = [];
    for (let i = 0; i < 4; i++) {
      const ringGeom = new THREE.RingGeometry(0.5, 0.65, 32);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0x00ff9c,
        transparent: true,
        opacity: 0,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending
      });
      const ring = new THREE.Mesh(ringGeom, ringMat);
      ring.position.z = 4.2;
      scene.add(ring);
      shockwaveRings.push({ mesh: ring, scale: 1.0, alpha: 0, delay: i * 0.4 });
    }
  }

  function updateShockwaves(dt, rpmFrac) {
    if (state.rpm < 14000) {
      shockwaveRings.forEach(sw => sw.mesh.material.opacity = 0);
      return;
    }

    shockwaveRings.forEach(sw => {
      sw.scale += dt * 3.5 * rpmFrac;
      sw.alpha -= dt * 1.6;

      if (sw.alpha <= 0 || sw.scale > 4.5) {
        sw.scale = 1.0;
        sw.alpha = state.isBoosted ? 0.85 : 0.45;
      }

      sw.mesh.scale.set(sw.scale, sw.scale, 1);
      sw.mesh.material.opacity = Math.max(0, sw.alpha);
      sw.mesh.material.color.setHex(state.isBoosted ? 0x00ff9c : 0x00e5ff);
    });
  }

  // --- Camera Position & Orbit Controls ---
  function updateCameraPosition() {
    if (!camera) return;

    // Spherical Coordinates
    const x = state.zoomDist * Math.sin(state.rotY) * Math.cos(state.rotX);
    const y = state.zoomDist * Math.sin(state.rotX);
    const z = state.zoomDist * Math.cos(state.rotY) * Math.cos(state.rotX);

    camera.position.set(x, y, z);
    camera.lookAt(0, 0, 0);
  }

  // Preset Camera Angles
  window.setCompressorCameraPreset = function(preset, ev) {
    if (ev) ev.stopPropagation();
    state.cameraPreset = preset;

    if (preset === 'iso') {
      state.targetRotX = 0.38;
      state.targetRotY = 0.72;
      state.targetZoomDist = 10.5;
    } else if (preset === 'cutaway') {
      // Longitudinal profile looking right into the cutaway window
      state.targetRotX = 0.08;
      state.targetRotY = Math.PI * 0.48;
      state.targetZoomDist = 9.8;
    } else if (preset === 'front') {
      // Looking directly into the intake fan
      state.targetRotX = 0.04;
      state.targetRotY = 0.02;
      state.targetZoomDist = 10.2;
    }

    // Update Button Active States
    [camBtnIso, camBtnCutaway, camBtnFront].forEach(btn => {
      if (btn) btn.classList.remove('active');
    });
    if (preset === 'iso' && camBtnIso) camBtnIso.classList.add('active');
    if (preset === 'cutaway' && camBtnCutaway) camBtnCutaway.classList.add('active');
    if (preset === 'front' && camBtnFront) camBtnFront.classList.add('active');

    dismissHint();
  };

  function dismissHint() {
    if (hintBadge && !hintBadge.classList.contains('hidden')) {
      hintBadge.classList.add('hidden');
    }
  }

  // --- Pointer & Touch Orbit Event Handlers ---
  function setupOrbitControls() {
    if (!canvas) return;

    const onPointerDown = (e) => {
      state.isDragging = true;
      state.hasInteracted = true;
      state.dragStartX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
      state.dragStartY = e.clientY || (e.touches && e.touches[0].clientY) || 0;
      state.velX = 0;
      state.velY = 0;
      if (stageEl) stageEl.classList.add('is-dragging');
      dismissHint();
    };

    const onPointerMove = (e) => {
      if (!state.isDragging) return;
      const clientX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
      const clientY = e.clientY || (e.touches && e.touches[0].clientY) || 0;

      const dx = clientX - state.dragStartX;
      const dy = clientY - state.dragStartY;

      state.dragStartX = clientX;
      state.dragStartY = clientY;

      state.velY = dx * 0.007;
      state.velX = -dy * 0.007;

      state.targetRotY += state.velY;
      state.targetRotX = Math.max(-Math.PI * 0.42, Math.min(Math.PI * 0.42, state.targetRotX + state.velX));
    };

    const onPointerUp = () => {
      state.isDragging = false;
      if (stageEl) stageEl.classList.remove('is-dragging');
    };

    const onWheel = (e) => {
      e.preventDefault();
      state.targetZoomDist = Math.max(6.5, Math.min(15.0, state.targetZoomDist + e.deltaY * 0.01));
    };

    canvas.addEventListener('mousedown', onPointerDown, { passive: true });
    window.addEventListener('mousemove', onPointerMove, { passive: true });
    window.addEventListener('mouseup', onPointerUp, { passive: true });

    canvas.addEventListener('touchstart', onPointerDown, { passive: true });
    window.addEventListener('touchmove', onPointerMove, { passive: true });
    window.addEventListener('touchend', onPointerUp, { passive: true });

    canvas.addEventListener('wheel', onWheel, { passive: false });
  }

  // --- Resize Handler ---
  function onResize() {
    if (!canvas || !renderer || !camera) return;
    const width = canvas.clientWidth || 480;
    const height = canvas.clientHeight || 275;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
  }

  // ==========================================================================
  // MAIN ANIMATION RENDER LOOP
  // ==========================================================================

  function render(now) {
    requestAnimationFrame(render);

    if (!state.inViewport) return;

    const dt = Math.min((now - state.lastFrameTime) / 1000, 0.1);
    state.lastFrameTime = now;

    // 1. Spool-up / Spool-down Inertia
    if (state.isRunning) {
      if (state.isBoosted) {
        state.targetRpm = state.maxRpm;
      } else {
        state.targetRpm = state.idleRpm + (state.throttle / 100) * (19500 - state.idleRpm);
      }
    } else {
      state.targetRpm = 0;
    }

    const accelRate = state.targetRpm > state.rpm ? 4.8 : 2.6;
    state.rpm += (state.targetRpm - state.rpm) * Math.min(1, dt * accelRate);
    if (state.rpm < 50 && !state.isRunning) state.rpm = 0;

    const rpmFrac = Math.max(0, Math.min(1, state.rpm / state.maxRpm));

    // Dynamic rotation angle increment
    const rotSpeed = (state.rpm / 60) * 0.12 * (Math.PI * 2);
    state.angle += rotSpeed * dt;

    // Telemetry & Audio
    const sensorJitter = (Math.random() - 0.5) * (state.rpm * 0.006);
    updateTelemetry(sensorJitter);
    updateAudioParams();

    // 2. Camera Damping & Orbit
    if (!state.isDragging) {
      // Idle slow cinematic drift
      state.targetRotY += dt * 0.12 * (0.4 + 0.6 * rpmFrac);
    }

    state.rotX += (state.targetRotX - state.rotX) * Math.min(1, dt * 9.0);
    state.rotY += (state.targetRotY - state.rotY) * Math.min(1, dt * 9.0);
    state.zoomDist += (state.targetZoomDist - state.zoomDist) * Math.min(1, dt * 8.0);
    updateCameraPosition();

    // 3. Render Three.js WebGL Scene
    if (state.useWebGL && renderer && scene && camera) {
      if (rotorGroup) {
        rotorGroup.rotation.z = state.angle;
      }
      updateCfdParticles(dt, rpmFrac);
      updateShockwaves(dt, rpmFrac);

      renderer.render(scene, camera);
    } else {
      // Fallback: 2D Canvas rendering
      render2dFallback(dt, rpmFrac);
    }
  }

  // ==========================================================================
  // GRACEFUL 2D CANVAS MECHANICAL CROSS-SECTION FALLBACK
  // ==========================================================================

  function render2dFallback(dt, rpmFrac) {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    const cx = w * 0.5;
    const cy = h * 0.5;
    const radius = Math.min(w, h) * 0.44;

    // Multi-stage rotating disk
    ctx.save();
    ctx.translate(cx, cy);

    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.strokeStyle = '#00e5ff';
    ctx.lineWidth = 2;
    ctx.stroke();

    const blades = 20;
    for (let i = 0; i < blades; i++) {
      const a = state.angle + (i / blades) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * radius * 0.35, Math.sin(a) * radius * 0.35);
      ctx.lineTo(Math.cos(a + 0.25) * radius * 0.92, Math.sin(a + 0.25) * radius * 0.92);
      ctx.strokeStyle = state.isBoosted ? '#00ff9c' : '#00e5ff';
      ctx.lineWidth = 3.5;
      ctx.stroke();
    }

    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.35, 0, Math.PI * 2);
    ctx.fillStyle = '#06131d';
    ctx.fill();
    ctx.strokeStyle = '#00ff9c';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.restore();
  }

  // ==========================================================================
  // USER INTERACTION CONTROLS
  // ==========================================================================

  // Power Button
  window.toggleCompressorEngine = function (ev) {
    if (ev) ev.stopPropagation();
    state.isRunning = !state.isRunning;

    if (powerBtn) {
      if (state.isRunning) {
        powerBtn.classList.add('active');
        if (powerText) powerText.textContent = 'روشن';
      } else {
        powerBtn.classList.remove('active');
        if (powerText) powerText.textContent = 'خاموش';
      }
    }
    if (boostBtn && !state.isRunning) {
      boostBtn.classList.remove('active');
      state.isBoosted = false;
    }
  };

  // Turbo Boost Button
  window.boostCompressorEngine = function (ev) {
    if (ev) ev.stopPropagation();
    if (!state.isRunning) {
      state.isRunning = true;
      if (powerBtn) powerBtn.classList.add('active');
      if (powerText) powerText.textContent = 'روشن';
    }

    state.isBoosted = !state.isBoosted;
    if (boostBtn) {
      boostBtn.classList.toggle('active', state.isBoosted);
    }
    if (stageEl) {
      stageEl.setAttribute('data-state', state.isBoosted ? 'boosted' : 'running');
    }
  };

  // View Mode Switcher
  window.cycleCompressorMode = function (ev) {
    if (ev) ev.stopPropagation();
    state.modeIndex = (state.modeIndex + 1) % state.modes.length;
    state.viewMode = state.modes[state.modeIndex];

    if (modeText) {
      modeText.textContent = state.modeLabels[state.viewMode];
    }

    // Update Three.js blade materials
    if (state.useWebGL && rotorGroup) {
      const activeMat = bladeMaterials[state.viewMode] || bladeMaterials.cfd;
      rotorGroup.children.forEach(child => {
        if (child.isInstancedMesh && child.name.startsWith('rotorStage')) {
          child.material = activeMat;
        }
      });
    }
  };

  // Audio Toggle
  window.toggleCompressorAudio = function (ev) {
    if (ev) ev.stopPropagation();
    initAudio();
    if (!state.audioCtx) return;

    if (state.audioCtx.state === 'suspended') {
      state.audioCtx.resume();
    }

    state.isAudioActive = !state.isAudioActive;
    if (soundBtn) {
      soundBtn.classList.toggle('active', state.isAudioActive);
    }
    if (soundIcon) {
      soundIcon.setAttribute('data-lucide', state.isAudioActive ? 'volume-2' : 'volume-x');
      if (window.lucide) lucide.createIcons();
    }
  };

  // Throttle Slider
  window.setCompressorThrottle = function (val) {
    state.throttle = Math.max(0, Math.min(100, parseInt(val, 10)));
    if (throttlePercentEl) {
      throttlePercentEl.textContent = state.throttle + '%';
    }
    if (state.isBoosted && state.throttle < 90) {
      state.isBoosted = false;
      if (boostBtn) boostBtn.classList.remove('active');
    }
  };

  // ==========================================================================
  // INITIALIZATION & LIFECYCLE
  // ==========================================================================

  function init() {
    stageEl = document.getElementById('heroCompressorStage');
    canvas = document.getElementById('heroCompressorCanvas');
    imgEl = document.getElementById('heroCompressorImg');
    hintBadge = document.getElementById('compressor3dHint');

    statusLabelEl = document.getElementById('compressorStatusLabel');
    rpmDisplayEl = document.getElementById('compressorRpmDisplay');
    prDisplayEl = document.getElementById('compressorPrDisplay');
    flowDisplayEl = document.getElementById('compressorFlowDisplay');
    tempDisplayEl = document.getElementById('compressorTempDisplay');

    powerBtn = document.getElementById('compressorPowerBtn');
    powerText = document.getElementById('compressorPowerText');
    boostBtn = document.getElementById('compressorBoostBtn');
    modeBtn = document.getElementById('compressorModeBtn');
    modeText = document.getElementById('compressorModeText');
    soundBtn = document.getElementById('compressorSoundBtn');
    soundText = document.getElementById('compressorSoundText');
    soundIcon = document.getElementById('compressorSoundIcon');

    throttleInput = document.getElementById('compressorThrottleInput');
    throttlePercentEl = document.getElementById('compressorThrottlePercent');

    camBtnIso = document.getElementById('btnCamIso');
    camBtnCutaway = document.getElementById('btnCamCutaway');
    camBtnFront = document.getElementById('btnCamFront');

    if (!canvas) return;

    updateThemeState();

    // 1. Initialize Three.js Engine
    initThreeEngine();

    // 2. Setup Orbit Drag & Touch Controls
    setupOrbitControls();

    // 3. Responsive Resize Observer
    window.addEventListener('resize', onResize);
    if (window.ResizeObserver && stageEl) {
      new ResizeObserver(onResize).observe(stageEl);
    }

    // 4. Viewport Intersection Observer (pause rendering when scrolled out of view)
    if ('IntersectionObserver' in window && stageEl) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          state.inViewport = entry.isIntersecting;
        });
      }, { threshold: 0.1 });
      observer.observe(stageEl);
    }

    // 5. Auto dismiss 3D hint badge after 4 seconds
    setTimeout(dismissHint, 4200);

    // Refresh Lucide Icons for 3D controls & presets
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      try { window.lucide.createIcons(); } catch (err) {}
    }

    // 6. Start Render Loop
    requestAnimationFrame(render);
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
