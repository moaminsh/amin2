/**
 * ============================================================================
 * FluidMind // High-Fidelity 3D Turbomachinery & Axial Compressor Digital Twin
 * Mohammadamin Sharif - Mechanical Engineering (IUST & Babol Noshirvani)
 * 
 * Comprehensive Engineering Simulator & Virtual Test Cell:
 * 1. Dual Three.js WebGL 3D Rendering (Hero Stage & Full Virtual Test Cell Modal)
 * 2. 4 Stages of titanium twisted & cambered NACA 65-series aerofoil blades
 * 3. Aerodynamic spinner nose cone with aviation spiral, drive shaft, and dovetail roots
 * 4. Stationary inter-stage stator vane cascades & variable inlet guide vanes (VIGVs)
 * 5. Cutaway nacelle casing with interactive slice angle slider
 * 6. Exploded assembly view (disassembly along Z axis)
 * 7. 240 active 3D CFD compressible fluid particles with Mach number color gradient
 * 8. Supersonic condensation shock diamonds during Turbo Boost (24,000 RPM)
 * 9. Real-time dynamic Compressor Performance Map (Surge & Choke Envelope with live operating point)
 * 10. Euler Turbomachinery Velocity Triangles Vector Engine
 * 11. 4-Stage aerodynamic & structural finite element stress breakdown table
 * 12. Working gas properties (Air, sCO2, CH4, N2) & ambient altitude / temperature physics
 * 13. Realistic Web Audio API jet engine spool synthesizer & surge warning acoustics
 * 14. Automated RPM speed sweep test & CSV telemetry export
 * ============================================================================
 */

(function () {
  'use strict';

  // --- Comprehensive Engine State ---
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
    
    // Physics & Working Fluid Conditions
    workingFluid: 'air',       // 'air' | 'sco2' | 'ch4' | 'n2'
    fluidGamma: 1.40,
    fluidR: 287.05,
    inletTempC: 15.0,          // Ambient Temp in Celsius
    altitudeM: 0,              // Ambient Altitude in meters
    vigvAngleDeg: 0,           // Variable Inlet Guide Vanes (-25° to +25°)
    backPressureValve: 45,     // 10% to 95% (Higher valve = higher back pressure = closer to surge!)
    isSurging: false,
    surgeMargin: 18.5,         // percentage
    
    // Virtual Test Cell Specifics
    isLabOpen: false,
    labExplodeProgress: 0,     // 0 (assembled) to 1 (fully exploded)
    labCutawayAngleDeg: 140,   // Cutaway window degrees (0 to 180)
    labSimSpeed: 1.0,          // Time scale
    labWireframe: false,
    activeLabTab: 'perf',      // 'perf' | 'euler' | 'stages' | 'fluid'
    isSweepRunning: false,
    
    // Web Audio API Nodes
    audioCtx: null,
    audioGain: null,
    whineOsc: null,
    rumbleOsc: null,
    noiseNode: null,
    noiseFilter: null,
    surgeOsc: null,

    // Timing & Visibility
    lastFrameTime: performance.now(),
    inViewport: true,
    useWebGL: false,

    // Hero 3D Orbit Camera Controls
    isDragging: false,
    dragStartX: 0,
    dragStartY: 0,
    rotX: 0.28,                // Elevation
    rotY: 0.68,                // Azimuth
    velX: 0,
    velY: 0,
    targetRotX: 0.28,
    targetRotY: 0.68,
    zoomDist: 21.0,
    targetZoomDist: 21.0,
    cameraPreset: 'iso',
    hasInteracted: false,

    // Lab 3D Orbit Camera Controls
    labIsDragging: false,
    labDragStartX: 0,
    labDragStartY: 0,
    labRotX: 0.26,
    labRotY: 0.72,
    labVelX: 0,
    labVelY: 0,
    labTargetRotX: 0.26,
    labTargetRotY: 0.72,
    labZoomDist: 22.0,
    labTargetZoomDist: 22.0
  };

  // --- Cached DOM Elements ---
  let stageEl, heroCanvas, labModal, labCanvas, hintBadge;
  let statusLabelEl, rpmDisplayEl, prDisplayEl, flowDisplayEl, tempDisplayEl, effDisplayEl;
  let powerBtn, powerText, boostBtn, modeBtn, modeText, soundBtn, soundText, soundIcon;
  let throttleInput, throttlePercentEl;
  let camBtnIso, camBtnCutaway, camBtnFront, camBtnAft;
  let labPerfMapCanvas, labVelocityCanvas, labSurgeAlert;

  // --- Three.js Hero Instance ---
  let rendererHero, sceneHero, cameraHero;
  let rotorGroupHero, statorGroupHero, casingGroupHero, particlesMeshHero, particlesDataHero = [];
  let bladeMaterialsHero = {}, shockwaveRingsHero = [];

  // --- Three.js Lab Instance ---
  let rendererLab, sceneLab, cameraLab;
  let rotorGroupLab, statorGroupLab, casingGroupLab, particlesMeshLab, particlesDataLab = [];
  let bladeMaterialsLab = {}, shockwaveRingsLab = [];

  // Compressor Physical Stage Specifications (4 Stages - High-Fidelity Densely Bladed Rotor)
  const STAGES = [
    { name: 'مرحله ۱ (فن ورودی)', z: 2.6, rHub: 1.5, rTip: 4.35, chordRoot: 0.88, chordTip: 0.58, stagger: 34, count: 28 },
    { name: 'مرحله ۲ (فشار متوسط)', z: 0.8, rHub: 1.72, rTip: 3.85, chordRoot: 0.74, chordTip: 0.46, stagger: 40, count: 32 },
    { name: 'مرحله ۳ (فشار بالا)', z: -0.9, rHub: 1.92, rTip: 3.35, chordRoot: 0.64, chordTip: 0.38, stagger: 46, count: 36 },
    { name: 'مرحله ۴ (دیفیوزر)', z: -2.6, rHub: 2.12, rTip: 2.90, chordRoot: 0.55, chordTip: 0.32, stagger: 52, count: 40 }
  ];

  const STATORS = [
    { name: 'IGV ورودی', z: 3.4, rHub: 1.52, rTip: 4.35, chord: 0.50, stagger: -28, count: 18 },
    { name: 'استاتور ۱', z: 1.6, rHub: 1.62, rTip: 4.05, chord: 0.44, stagger: -34, count: 22 },
    { name: 'استاتور ۲', z: -0.1, rHub: 1.82, rTip: 3.55, chord: 0.40, stagger: -40, count: 26 },
    { name: 'استاتور ۳', z: -1.8, rHub: 2.02, rTip: 3.05, chord: 0.36, stagger: -46, count: 30 }
  ];

  const CFD_COUNT = 240;

  // ==========================================================================
  // WEB AUDIO API TURBINE & JET SPOOL SYNTHESIZER
  // ==========================================================================

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

      // 1. Blade-Pass High Whine (Harmonics of rotor blades passing stators)
      state.whineOsc = state.audioCtx.createOscillator();
      state.whineOsc.type = 'sine';
      state.whineOsc.frequency.setValueAtTime(750, state.audioCtx.currentTime);

      const whineGain = state.audioCtx.createGain();
      whineGain.gain.setValueAtTime(0.14, state.audioCtx.currentTime);
      state.whineOsc.connect(whineGain);
      whineGain.connect(state.audioGain);
      state.whineOsc.start();

      // 2. Shaft Low-Frequency Mechanical Rumble
      state.rumbleOsc = state.audioCtx.createOscillator();
      state.rumbleOsc.type = 'triangle';
      state.rumbleOsc.frequency.setValueAtTime(58, state.audioCtx.currentTime);

      const rumbleFilter = state.audioCtx.createBiquadFilter();
      rumbleFilter.type = 'lowpass';
      rumbleFilter.frequency.setValueAtTime(140, state.audioCtx.currentTime);

      const rumbleGain = state.audioCtx.createGain();
      rumbleGain.gain.setValueAtTime(0.18, state.audioCtx.currentTime);
      state.rumbleOsc.connect(rumbleFilter);
      rumbleFilter.connect(rumbleGain);
      rumbleGain.connect(state.audioGain);
      state.rumbleOsc.start();

      // 3. Turbulent Aerodynamic Roar (Pink Noise)
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
      state.noiseFilter.Q.setValueAtTime(1.4, state.audioCtx.currentTime);

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

    const targetGain = 0.24 * (0.35 + 0.65 * rpmFrac);
    state.audioGain.gain.setTargetAtTime(targetGain, now, 0.08);

    if (state.whineOsc) {
      const whineFreq = 380 + rpmFrac * 1520;
      state.whineOsc.frequency.setTargetAtTime(whineFreq, now, 0.06);
    }
    if (state.rumbleOsc) {
      const rumbleFreq = 35 + rpmFrac * 70;
      state.rumbleOsc.frequency.setTargetAtTime(rumbleFreq, now, 0.06);
    }
    if (state.noiseFilter) {
      const filterFreq = 680 + rpmFrac * 2400;
      state.noiseFilter.frequency.setTargetAtTime(filterFreq, now, 0.06);
    }
  }

  function playSurgePulse() {
    if (!state.audioCtx || !state.isAudioActive) return;
    try {
      const osc = state.audioCtx.createOscillator();
      const gain = state.audioCtx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(110, state.audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(35, state.audioCtx.currentTime + 0.25);
      gain.gain.setValueAtTime(0.35, state.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, state.audioCtx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(state.audioCtx.destination);
      osc.start();
      osc.stop(state.audioCtx.currentTime + 0.26);
    } catch (e) {}
  }

  // ==========================================================================
  // THERMODYNAMICS & EULER TURBOMACHINERY CALCULATIONS
  // ==========================================================================

  function calculateAerodynamics() {
    const rpmFrac = state.rpm / state.maxRpm;
    
    // Altitude correction (ISA model)
    const altKm = state.altitudeM / 1000;
    const pAmb = 101.325 * Math.pow(1 - 0.0225577 * altKm, 5.25588); // kPa
    const tAmbK = 273.15 + state.inletTempC - 6.5 * altKm;           // Kelvin
    const rhoInlet = (pAmb * 1000) / (state.fluidR * tAmbK);

    // Corrected speed
    const nCorr = state.rpm / Math.sqrt(tAmbK / 288.15);

    // VIGV flow modulation (-25° to +25°)
    const vigvFactor = Math.cos((state.vigvAngleDeg * Math.PI) / 180);

    // Mass flow: m_dot = frac * 62.4 * (rho / 1.225) * vigvFactor
    const baseFlow = state.rpm > 300 ? (rpmFrac * 58.0 + 4.2) * (rhoInlet / 1.225) * vigvFactor : 0.0;

    // Back pressure valve effect (Throttle valve restricts mass flow and increases pressure ratio)
    const valveFrac = state.backPressureValve / 100;
    const actualFlow = Math.max(0, baseFlow * (1.15 - valveFrac * 0.45));

    // Pressure Ratio: Pi_c = 1 + (rpmFrac^2.25) * 19.8 * fluidFactor
    const fluidFactor = state.fluidGamma === 1.28 ? 1.18 : 1.0;
    const nominalPr = 1.0 + Math.pow(rpmFrac, 2.25) * 19.8 * fluidFactor;
    
    // As valve closes (back-pressure rises), operating pressure ratio increases toward surge line
    const actualPr = state.rpm > 300 ? Math.min(26.0, nominalPr * (0.85 + valveFrac * 0.35)) : 1.0;

    // Surge boundary: Pi_surge = 1.2 + 0.34 * actualFlow
    const surgePr = 1.2 + 0.34 * actualFlow;
    const surgeMarginVal = actualPr > 1.0 ? ((surgePr - actualPr) / actualPr) * 100 : 50;
    state.surgeMargin = Math.max(-15, Math.min(60, surgeMarginVal));

    // Surge Detection: if operating point exceeds surge line or margin < 4%
    const wasSurging = state.isSurging;
    state.isSurging = state.rpm > 3000 && state.surgeMargin < 4.0;
    if (state.isSurging && !wasSurging) {
      playSurgePulse();
    }

    // Isentropic Stage Temperature: T2 = T1 * Pi_c^((gamma-1)/(gamma * eta))
    const isentropicEff = Math.max(0.72, Math.min(0.94, 0.924 - (Math.abs(rpmFrac - 0.77) * 0.12) - (state.isSurging ? 0.25 : 0)));
    const exponent = (state.fluidGamma - 1) / (state.fluidGamma * isentropicEff);
    const t2K = tAmbK * Math.pow(actualPr, exponent);
    const t2C = t2K - 273.15;

    // Shaft Power: P = m_dot * cp * (T2 - T1) / 1000  (MW)
    const cp = (state.fluidGamma * state.fluidR) / (state.fluidGamma - 1);
    const powerMw = (actualFlow * cp * (t2K - tAmbK)) / 1e6;

    // Euler Work: Delta h0 = cp * Delta T (kJ/kg)
    const eulerWork = (cp * (t2K - tAmbK)) / 1000;

    // Velocity Triangle components (Stage 1 tip)
    const rTip1 = 0.43; // meters
    const omega = (state.rpm * Math.PI) / 30; // rad/s
    const u1 = omega * rTip1;
    const u2 = u1;
    const cz = actualFlow / (rhoInlet * Math.PI * (Math.pow(rTip1, 2) - Math.pow(0.15, 2)));
    const cTheta1 = u1 * 0.18 + (state.vigvAngleDeg * 1.5);
    const cTheta2 = cTheta1 + (eulerWork * 1000) / (u1 || 1);
    const c1 = Math.sqrt(Math.pow(cz, 2) + Math.pow(cTheta1, 2));
    const c2 = Math.sqrt(Math.pow(cz, 2) + Math.pow(cTheta2, 2));
    const w1 = Math.sqrt(Math.pow(cz, 2) + Math.pow(u1 - cTheta1, 2));
    const w2 = Math.sqrt(Math.pow(cz, 2) + Math.pow(u2 - cTheta2, 2));
    const beta1 = (Math.atan2(u1 - cTheta1, cz) * 180) / Math.PI;
    const beta2 = (Math.atan2(u2 - cTheta2, cz) * 180) / Math.PI;
    const flowDeflection = Math.abs(beta1 - beta2);
    const reactionDegree = Math.max(0.3, Math.min(0.7, 1 - (cTheta1 + cTheta2) / (2 * (u1 || 1))));

    return {
      pr: actualPr,
      flow: actualFlow,
      t2: t2C,
      eff: isentropicEff,
      power: Math.max(0, powerMw),
      eulerWork: Math.max(0, eulerWork),
      flowDeflection: flowDeflection,
      reactionDegree: reactionDegree,
      u1, u2, c1, c2, w1, w2, beta1, beta2, cz,
      surgeMargin: state.surgeMargin
    };
  }

  // --- Update HUD & Diagnostics ---
  function updateTelemetry(metrics, jitter) {
    if (!statusLabelEl || !rpmDisplayEl) return;

    const displayRpm = Math.max(0, Math.round(state.rpm + (state.rpm > 500 ? jitter : 0)));
    rpmDisplayEl.textContent = displayRpm.toLocaleString('en-US') + ' RPM';

    if (prDisplayEl) prDisplayEl.textContent = metrics.pr.toFixed(1) + ':1';
    if (flowDisplayEl) flowDisplayEl.textContent = metrics.flow.toFixed(1) + ' kg/s';
    if (tempDisplayEl) tempDisplayEl.textContent = Math.round(metrics.t2) + '°C';
    if (effDisplayEl) effDisplayEl.textContent = (metrics.eff * 100).toFixed(1) + '%';

    if (stageEl) {
      if (state.isRunning && state.rpm > 1000) {
        stageEl.classList.add('running');
        stageEl.setAttribute('data-state', state.isBoosted ? 'boosted' : (state.isSurging ? 'surging' : 'running'));
        if (statusLabelEl) {
          statusLabelEl.textContent = state.isSurging ? 'هشدار سرج (Surge)' : (state.isBoosted ? 'توربو بوست فعال' : 'کمپرسور فعال');
        }
      } else {
        stageEl.classList.remove('running');
        stageEl.setAttribute('data-state', 'stopped');
        if (statusLabelEl) statusLabelEl.textContent = 'خاموش / آماده';
      }
    }

    // Update Virtual Lab UI if opened
    if (state.isLabOpen) {
      const labPrVal = document.getElementById('labPrVal');
      const labFlowVal = document.getElementById('labFlowVal');
      const labSmVal = document.getElementById('labSmVal');
      const labPowerVal = document.getElementById('labPowerVal');
      const labSurgeBanner = document.getElementById('labSurgeAlertBanner');

      if (labPrVal) labPrVal.textContent = metrics.pr.toFixed(1) + ':1';
      if (labFlowVal) labFlowVal.textContent = metrics.flow.toFixed(1) + ' kg/s';
      if (labSmVal) {
        labSmVal.textContent = metrics.surgeMargin.toFixed(1) + '%';
        labSmVal.style.color = metrics.surgeMargin < 6 ? '#ef4444' : '#00ff9c';
      }
      if (labPowerVal) labPowerVal.textContent = metrics.power.toFixed(1) + ' MW';
      if (labSurgeBanner) {
        labSurgeBanner.classList.toggle('active', state.isSurging);
      }

      // Euler work displays
      const labEulerWork = document.getElementById('labEulerWork');
      const labFlowDeflect = document.getElementById('labFlowDeflect');
      const labReactionDeg = document.getElementById('labReactionDeg');
      if (labEulerWork) labEulerWork.textContent = metrics.eulerWork.toFixed(1) + ' kJ/kg';
      if (labFlowDeflect) labFlowDeflect.textContent = 'Δβ = ' + metrics.flowDeflection.toFixed(1) + '°';
      if (labReactionDeg) labReactionDeg.textContent = 'Rx = ' + metrics.reactionDegree.toFixed(2);

      // Multi-stage table live numbers
      const stgTotalPr = document.getElementById('stgTotalPr');
      const stgTotalTemp = document.getElementById('stgTotalTemp');
      if (stgTotalPr) stgTotalPr.textContent = metrics.pr.toFixed(1) + ' : 1';
      if (stgTotalTemp) stgTotalTemp.textContent = '+' + Math.round(metrics.t2 - state.inletTempC) + ' °C';

      // Stage 1 tip mach and stress
      const stg1Mach = document.getElementById('stg1Mach');
      const stg1Stress = document.getElementById('stg1Stress');
      const aSound = Math.sqrt(state.fluidGamma * state.fluidR * (273.15 + state.inletTempC));
      const mTip = metrics.u1 / aSound;
      if (stg1Mach) {
        stg1Mach.textContent = mTip.toFixed(2) + (mTip > 1 ? ' (ترنزونیک)' : ' (ساب‌سونیک)');
      }
      if (stg1Stress) {
        const rootStress = Math.round(284 * Math.pow(state.rpm / 18450, 2));
        stg1Stress.textContent = rootStress + ' MPa';
      }
    }
  }

  // ==========================================================================
  // THREE.JS 3D MESH GENERATION (Twisted NACA 65 Aerofoil Blades)
  // ==========================================================================

  function createAirfoilBladeGeometry(rHub, rTip, chordRoot, chordTip, staggerDeg, isLab) {
    const geom = new THREE.BufferGeometry();
    const pos = [];
    const uvs = [];
    const colors = [];
    const indices = [];

    const spanSteps = 10;
    const nSide = 8; // 8 points on lower surface + 8 points on upper surface = 16 points per closed airfoil loop
    const nLoop = nSide * 2;
    const staggerRad = (staggerDeg * Math.PI) / 180;

    // Station points matrix: stationIndices[s][k]
    const stationIndices = [];

    for (let s = 0; s <= spanSteps; s++) {
      const spanFrac = s / spanSteps;
      const r = rHub + (rTip - rHub) * spanFrac;
      const chord = chordRoot + (chordTip - chordRoot) * spanFrac;

      // Aerodynamic wash-out twist: pitch angle decreases radially to satisfy radial equilibrium
      const localStagger = staggerRad * (1.18 - 0.28 * spanFrac);

      // NACA 65-series max thickness and camber distribution
      const tMax = chord * 0.12 * (1.0 - 0.30 * spanFrac);
      const cMax = chord * 0.075;

      // Elegant scimitar aerodynamic sweep curvature along span
      const sweepX = -0.10 * chord * Math.pow(spanFrac, 2.2);
      const sweepZ = 0.15 * chord * Math.pow(spanFrac, 1.8);

      // von Mises stress gradient from root (high load crimson/amber) to tip (cyan/blue)
      const stressFrac = 1.0 - spanFrac;
      const stressColor = computeStressColor(stressFrac);

      const loop = [];

      for (let k = 0; k < nLoop; k++) {
        let xc, isUpper;
        if (k < nSide) {
          // Lower pressure surface: from trailing edge (xc=1) to leading edge (xc=0)
          xc = 1.0 - k / nSide;
          isUpper = false;
        } else {
          // Upper suction surface: from leading edge (xc=0) to trailing edge (xc=1)
          xc = (k - nSide) / nSide;
          isUpper = true;
        }

        // NACA circular arc camber line
        const camber = 4.0 * cMax * xc * (1.0 - xc);
        // Aerodynamic thickness distribution with rounded leading edge & crisp trailing edge
        const halfThick = 0.5 * tMax * Math.sqrt(Math.max(0.0001, xc)) * (1.0 - 0.95 * xc) * 1.8;

        const xLocal = (xc - 0.40) * chord;
        const zLocal = isUpper ? (camber + halfThick) : (camber - halfThick);

        // Rotate by local stagger angle + apply radial sweep
        const lx = xLocal * Math.cos(localStagger) - zLocal * Math.sin(localStagger) + sweepX;
        const lz = xLocal * Math.sin(localStagger) + zLocal * Math.cos(localStagger) + sweepZ;
        const ly = r;

        const vIdx = pos.length / 3;
        pos.push(lx, ly, lz);
        uvs.push(xc, spanFrac);
        colors.push(stressColor.r, stressColor.g, stressColor.b);
        loop.push(vIdx);
      }
      stationIndices.push(loop);
    }

    // Connect quads between adjacent span stations
    for (let s = 0; s < spanSteps; s++) {
      const ring0 = stationIndices[s];
      const ring1 = stationIndices[s + 1];

      for (let k = 0; k < nLoop; k++) {
        const kNext = (k + 1) % nLoop;
        const p0 = ring0[k];
        const p1 = ring0[kNext];
        const p2 = ring1[k];
        const p3 = ring1[kNext];

        indices.push(p0, p2, p1);
        indices.push(p1, p2, p3);
      }
    }

    // Aerodynamic Solid Tip Cap (Triangulated fan at blade tip)
    const tipRing = stationIndices[spanSteps];
    let tipCenterX = 0, tipCenterY = 0, tipCenterZ = 0;
    for (let k = 0; k < nLoop; k++) {
      tipCenterX += pos[tipRing[k] * 3];
      tipCenterY += pos[tipRing[k] * 3 + 1];
      tipCenterZ += pos[tipRing[k] * 3 + 2];
    }
    tipCenterX /= nLoop;
    tipCenterY /= nLoop;
    tipCenterZ /= nLoop;

    const tipCenterIdx = pos.length / 3;
    pos.push(tipCenterX, tipCenterY + 0.02, tipCenterZ);
    uvs.push(0.5, 1.0);
    const tipStress = computeStressColor(0);
    colors.push(tipStress.r, tipStress.g, tipStress.b);

    for (let k = 0; k < nLoop; k++) {
      const kNext = (k + 1) % nLoop;
      indices.push(tipCenterIdx, tipRing[k], tipRing[kNext]);
    }

    // Dovetail Root Base (Root platform interlocking securely into rotor disc rim)
    const rootRing = stationIndices[0];
    const rootBaseIndices = [];
    const rootStress = computeStressColor(1.0);
    for (let k = 0; k < nLoop; k++) {
      const origIdx = rootRing[k];
      const rx = pos[origIdx * 3] * 1.05;
      const ry = pos[origIdx * 3 + 1] - 0.22; // Inset into the disc
      const rz = pos[origIdx * 3 + 2] * 1.05;

      const baseIdx = pos.length / 3;
      pos.push(rx, ry, rz);
      uvs.push(uvs[origIdx * 2], 0.0);
      colors.push(rootStress.r, rootStress.g, rootStress.b);
      rootBaseIndices.push(baseIdx);
    }

    for (let k = 0; k < nLoop; k++) {
      const kNext = (k + 1) % nLoop;
      const r0 = rootRing[k];
      const r1 = rootRing[kNext];
      const b0 = rootBaseIndices[k];
      const b1 = rootBaseIndices[kNext];

      indices.push(r0, r1, b0);
      indices.push(r1, b1, b0);
    }

    geom.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    geom.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geom.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geom.setIndex(indices);
    geom.computeVertexNormals();
    return geom;
  }

  function computeStressColor(frac) {
    // 0 = Low stress (Deep Blue/Cyan), 0.5 = Moderate (Green/Yellow), 1.0 = High Stress (Crimson Red)
    if (frac < 0.35) {
      return { r: 0.0, g: 0.6 + frac * 1.1, b: 1.0 };
    } else if (frac < 0.7) {
      return { r: (frac - 0.35) * 2.8, g: 1.0, b: Math.max(0, 0.4 - (frac - 0.35) * 1.1) };
    } else {
      return { r: 1.0, g: Math.max(0, 0.9 - (frac - 0.7) * 3.0), b: 0.1 };
    }
  }

  // --- Build Scene Assemblies (Hero and Lab) ---
  // Notice: The outer compressor casing/shell has been intentionally completely removed as requested!
  // The display is now a pristine, unobstructed, fully bladed turbomachinery rotor digital twin.
  function buildTurbomachineScene(targetGroupRotor, targetGroupStator, targetGroupCasing, isLab) {
    // Aerospace Materials Rig
    const shaftMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      metalness: 0.88,
      roughness: 0.20
    });

    const discMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.92,
      roughness: 0.24
    });

    const drumMat = new THREE.MeshStandardMaterial({
      color: 0x0f1d2a,
      metalness: 0.86,
      roughness: 0.26
    });

    const noseMat = new THREE.MeshStandardMaterial({
      color: 0x09141f,
      metalness: 0.94,
      roughness: 0.14
    });

    const lockRingMat = new THREE.MeshStandardMaterial({
      color: 0x00e5ff,
      metalness: 0.90,
      roughness: 0.18
    });

    // 1. Central Drive Shaft (aligned along Z axis)
    const shaftGeom = new THREE.CylinderGeometry(0.52, 0.52, 10.4, 40);
    shaftGeom.rotateX(Math.PI * 0.5);
    const shaft = new THREE.Mesh(shaftGeom, shaftMat);
    shaft.position.z = -0.2;
    targetGroupRotor.add(shaft);

    // Rear Diffuser Aerodynamic Hub Cone & Bearing Flange
    const rearConeGeom = new THREE.ConeGeometry(2.05, 1.8, 48);
    rearConeGeom.rotateX(-Math.PI * 0.5);
    const rearCone = new THREE.Mesh(rearConeGeom, discMat);
    rearCone.position.z = -3.7;
    targetGroupRotor.add(rearCone);

    const rearFlangeGeom = new THREE.TorusGeometry(1.6, 0.10, 16, 48);
    const rearFlange = new THREE.Mesh(rearFlangeGeom, lockRingMat);
    rearFlange.position.z = -3.3;
    targetGroupRotor.add(rearFlange);

    // 2. Spinner Nose Cone with Dynamic Aviation Swirl Spiral
    const noseGeom = new THREE.ConeGeometry(1.50, 2.4, 48);
    noseGeom.rotateX(Math.PI * 0.5);
    const noseCone = new THREE.Mesh(noseGeom, noseMat);
    noseCone.position.z = 4.4;
    targetGroupRotor.add(noseCone);

    // Aviation Nose Spiral in Luminous Cyan/Emerald
    const spiralPoints = [];
    const turns = 2.6;
    const steps = 60;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const angle = t * Math.PI * 2 * turns;
      const rad = 1.46 * (1.0 - t * 0.94);
      const z = 3.25 + t * 2.2;
      spiralPoints.push(new THREE.Vector3(Math.cos(angle) * rad, Math.sin(angle) * rad, z));
    }
    const spiralGeom = new THREE.BufferGeometry().setFromPoints(spiralPoints);
    const spiralMat = new THREE.LineBasicMaterial({ color: 0x00ffcc, linewidth: 3 });
    const spiralLine = new THREE.Line(spiralGeom, spiralMat);
    targetGroupRotor.add(spiralLine);

    // 3. Multi-Stage Densely Bladed Rotor Cascades (4 Stages)
    STAGES.forEach((stg, idx) => {
      // Machined Hub Disc with Chamfered Rim
      const discGeom = new THREE.CylinderGeometry(stg.rHub, stg.rHub * 1.02, 0.58, 48);
      discGeom.rotateX(Math.PI * 0.5);
      const disc = new THREE.Mesh(discGeom, discMat);
      disc.position.z = stg.z;
      disc.name = `rotorDisc_${idx}`;
      targetGroupRotor.add(disc);

      // Circumferential Retaining Lock Ring with Precision Luster
      const ringGeom = new THREE.TorusGeometry(stg.rHub * 0.92, 0.05, 12, 48);
      const ring = new THREE.Mesh(ringGeom, lockRingMat);
      ring.position.z = stg.z + 0.30;
      targetGroupRotor.add(ring);

      // Inter-stage Spool Transition Drum (unifying the rotor into a single magnificent spool)
      if (idx < STAGES.length - 1) {
        const nextStg = STAGES[idx + 1];
        const drumLength = Math.abs(stg.z - nextStg.z) - 0.58;
        const drumGeom = new THREE.CylinderGeometry(nextStg.rHub * 0.98, stg.rHub * 0.98, drumLength, 48);
        drumGeom.rotateX(Math.PI * 0.5);
        const drumMesh = new THREE.Mesh(drumGeom, drumMat);
        drumMesh.position.z = (stg.z + nextStg.z) * 0.5;
        targetGroupRotor.add(drumMesh);
      }

      // High-Fidelity Solid 3D Titanium Aerofoil Blades
      const bladeGeom = createAirfoilBladeGeometry(stg.rHub, stg.rTip, stg.chordRoot, stg.chordTip, stg.stagger, isLab);
      const bladeMat = new THREE.MeshStandardMaterial({
        color: 0xd8e4ef,
        metalness: 0.88,
        roughness: 0.22,
        emissive: 0x071b28,
        vertexColors: false
      });

      const instMesh = new THREE.InstancedMesh(bladeGeom, bladeMat, stg.count);
      instMesh.name = `rotorStage_${idx}`;

      const dummy = new THREE.Object3D();
      for (let i = 0; i < stg.count; i++) {
        const bladeAngle = (i / stg.count) * Math.PI * 2;
        dummy.position.set(0, 0, stg.z);
        dummy.rotation.set(0, 0, bladeAngle);
        dummy.updateMatrix();
        instMesh.setMatrixAt(i, dummy.matrix);
      }
      instMesh.instanceMatrix.needsUpdate = true;
      targetGroupRotor.add(instMesh);
    });

    // 4. Stator Cascades (Only in Lab Modal during Exploded View Analysis)
    if (isLab) {
      const statorMat = new THREE.MeshStandardMaterial({
        color: 0x475569,
        metalness: 0.70,
        roughness: 0.32
      });

      STATORS.forEach((st, idx) => {
        // Inner hub ring for structural realism
        const statorHubGeom = new THREE.CylinderGeometry(st.rHub, st.rHub, 0.35, 36);
        statorHubGeom.rotateX(Math.PI * 0.5);
        const statorHub = new THREE.Mesh(statorHubGeom, shaftMat);
        statorHub.position.z = st.z;
        targetGroupStator.add(statorHub);

        const bladeGeom = createAirfoilBladeGeometry(st.rHub, st.rTip, st.chord, st.chord * 0.72, st.stagger, isLab);
        const instMesh = new THREE.InstancedMesh(bladeGeom, statorMat, st.count);
        instMesh.name = `statorStage_${idx}`;

        const dummy = new THREE.Object3D();
        for (let i = 0; i < st.count; i++) {
          const bladeAngle = (i / st.count) * Math.PI * 2;
          dummy.position.set(0, 0, st.z);
          dummy.rotation.set(0, 0, bladeAngle);
          dummy.updateMatrix();
          instMesh.setMatrixAt(i, dummy.matrix);
        }
        instMesh.instanceMatrix.needsUpdate = true;
        targetGroupStator.add(instMesh);
      });
    }

    // 5. Casing is intentionally omitted:
    // As per user specification, all outer nacelle casing meshes, cutaway half-cylinders,
    // and translucent shrouds have been completely removed.
    // The entire multi-stage bladed rotor assembly is now 100% exposed and visible.
  }

  // --- CFD Streamlines & Particles ---
  function initParticles(sceneTarget, particlesMeshTarget, particlesDataTarget) {
    const pos = new Float32Array(CFD_COUNT * 3);
    const col = new Float32Array(CFD_COUNT * 3);
    particlesDataTarget.length = 0;

    for (let i = 0; i < CFD_COUNT; i++) {
      const progress = Math.random();
      const z = 5.4 - progress * 9.8;
      const progressFrac = Math.max(0, Math.min(1, (5.4 - z) / 9.8));
      const rad = (4.25 - progressFrac * 1.85) * (0.55 + Math.random() * 0.45);
      const angle = Math.random() * Math.PI * 2;

      pos[i * 3] = Math.cos(angle) * rad;
      pos[i * 3 + 1] = Math.sin(angle) * rad;
      pos[i * 3 + 2] = z;

      const rgb = computeCfdColor(progressFrac);
      col[i * 3] = rgb.r;
      col[i * 3 + 1] = rgb.g;
      col[i * 3 + 2] = rgb.b;

      particlesDataTarget.push({
        angle: angle,
        progress: progress,
        speed: 1.4 + Math.random() * 2.2,
        swirlRate: 1.8 + Math.random() * 2.4
      });
    }

    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geom.setAttribute('color', new THREE.BufferAttribute(col, 3));

    const mat = new THREE.PointsMaterial({
      size: 0.22,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending
    });

    const mesh = new THREE.Points(geom, mat);
    sceneTarget.add(mesh);
    return mesh;
  }

  function computeCfdColor(progress) {
    if (state.viewMode === 'thermal') {
      return {
        r: 0.05 + progress * 0.95,
        g: Math.max(0.1, 0.85 - progress * 0.6),
        b: Math.max(0.05, 1.0 - progress * 0.95)
      };
    } else if (state.viewMode === 'mechanical') {
      return { r: 0.0, g: 0.95, b: 0.6 + progress * 0.4 };
    }
    // Standard CFD: Ice Blue -> Cyan -> Emerald Green -> Compressed Amber/Flame
    if (progress < 0.4) {
      return { r: 0.0, g: 0.85 + progress * 0.35, b: 1.0 };
    } else if (progress < 0.75) {
      return { r: (progress - 0.4) * 2.8, g: 1.0, b: 0.35 };
    } else {
      return { r: 1.0, g: Math.max(0.1, 0.7 - (progress - 0.75) * 2.2), b: 0.05 };
    }
  }

  function updateParticles(mesh, data, dt, rpmFrac) {
    if (!mesh) return;
    const pos = mesh.geometry.attributes.position.array;
    const col = mesh.geometry.attributes.color.array;

    for (let i = 0; i < CFD_COUNT; i++) {
      const p = data[i];
      const speed = p.speed * (0.35 + rpmFrac * 3.0);
      p.progress += (speed * dt) * 0.18;

      if (p.progress > 1.0) {
        p.progress = 0;
        p.angle = Math.random() * Math.PI * 2;
      }

      const z = 5.4 - p.progress * 9.8;
      const progressFrac = p.progress;

      p.angle += (p.swirlRate * rpmFrac * dt) * 2.8;
      const rad = (4.25 - progressFrac * 1.85) * (0.65 + 0.35 * Math.sin(p.angle * 2));

      pos[i * 3] = Math.cos(p.angle) * rad;
      pos[i * 3 + 1] = Math.sin(p.angle) * rad;
      pos[i * 3 + 2] = z;

      const rgb = computeCfdColor(progressFrac);
      col[i * 3] = rgb.r;
      col[i * 3 + 1] = rgb.g;
      col[i * 3 + 2] = rgb.b;
    }

    mesh.geometry.attributes.position.needsUpdate = true;
    mesh.geometry.attributes.color.needsUpdate = true;
  }

  // --- Supersonic Mach Rings ---
  function initShockwaves(sceneTarget) {
    const rings = [];
    for (let i = 0; i < 4; i++) {
      const ringGeom = new THREE.RingGeometry(0.5, 0.68, 36);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0x00ff9c,
        transparent: true,
        opacity: 0,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending
      });
      const ring = new THREE.Mesh(ringGeom, ringMat);
      ring.position.z = 4.3;
      sceneTarget.add(ring);
      rings.push({ mesh: ring, scale: 1.0, alpha: 0, delay: i * 0.4 });
    }
    return rings;
  }

  function updateShockwaves(rings, dt, rpmFrac) {
    if (state.rpm < 14000) {
      rings.forEach(sw => sw.mesh.material.opacity = 0);
      return;
    }

    rings.forEach(sw => {
      sw.scale += dt * 3.8 * rpmFrac;
      sw.alpha -= dt * 1.8;

      if (sw.alpha <= 0 || sw.scale > 4.6) {
        sw.scale = 1.0;
        sw.alpha = state.isBoosted ? 0.9 : 0.45;
      }

      sw.mesh.scale.set(sw.scale, sw.scale, 1);
      sw.mesh.material.opacity = Math.max(0, sw.alpha);
      sw.mesh.material.color.setHex(state.isBoosted ? 0x00ff9c : 0x00e5ff);
    });
  }

  // ==========================================================================
  // INITIALIZATION OF HERO THREE.JS WEBGL ENGINE
  // ==========================================================================

  function initHeroThreeEngine() {
    if (!window.THREE || !heroCanvas) return false;

    try {
      const width = heroCanvas.clientWidth || 480;
      const height = heroCanvas.clientHeight || 380;

      // 1. High Performance WebGL Renderer
      rendererHero = new THREE.WebGLRenderer({
        canvas: heroCanvas,
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance'
      });
      rendererHero.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      rendererHero.setSize(width, height, false);
      rendererHero.toneMapping = THREE.ACESFilmicToneMapping;
      rendererHero.toneMappingExposure = 1.3;

      // 2. Scene & Properly Framed Camera
      sceneHero = new THREE.Scene();
      cameraHero = new THREE.PerspectiveCamera(34, width / height, 0.1, 100);
      updateHeroCamera();

      // 3. Studio Lighting Rig for Crisp Chrome Reflections
      const ambientLight = new THREE.AmbientLight(0x283e52, 2.2);
      sceneHero.add(ambientLight);

      const keyLight = new THREE.DirectionalLight(0xffffff, 2.6);
      keyLight.position.set(12, 16, 14);
      sceneHero.add(keyLight);

      const fillLight = new THREE.DirectionalLight(0x00e5ff, 2.0);
      fillLight.position.set(-14, -8, -10);
      sceneHero.add(fillLight);

      const warmUnderglow = new THREE.DirectionalLight(0xff9900, 1.4);
      warmUnderglow.position.set(0, -12, 6);
      sceneHero.add(warmUnderglow);

      const spinnerGlow = new THREE.PointLight(0x00ffcc, 2.4, 25);
      spinnerGlow.position.set(0, 0, 4.0);
      sceneHero.add(spinnerGlow);

      // 4. Groups
      rotorGroupHero = new THREE.Group();
      statorGroupHero = new THREE.Group();
      casingGroupHero = new THREE.Group();

      sceneHero.add(rotorGroupHero);
      sceneHero.add(statorGroupHero);
      sceneHero.add(casingGroupHero);

      buildTurbomachineScene(rotorGroupHero, statorGroupHero, casingGroupHero, false);
      particlesMeshHero = initParticles(sceneHero, particlesMeshHero, particlesDataHero);
      shockwaveRingsHero = initShockwaves(sceneHero);

      state.useWebGL = true;
      return true;

    } catch (err) {
      console.warn('Three.js Hero init failed, falling back to 2D canvas:', err);
      state.useWebGL = false;
      return false;
    }
  }

  function updateHeroCamera() {
    if (!cameraHero) return;
    const aspect = cameraHero.aspect || 1.0;
    // Optical portrait compensation for mobile devices:
    // If aspect ratio is narrower than 1.15 (portrait on mobile), adjust camera distance
    // so that horizontal extent is not cropped and all blade tips are 100% visible!
    const portraitFactor = aspect < 1.15 ? 1.0 + Math.max(0, 1.15 - aspect) * 0.45 : 1.0;
    const dist = state.zoomDist * portraitFactor;

    const x = dist * Math.sin(state.rotY) * Math.cos(state.rotX);
    const y = dist * Math.sin(state.rotX);
    const z = dist * Math.cos(state.rotY) * Math.cos(state.rotX);
    cameraHero.position.set(x, y, z);
    cameraHero.lookAt(0, 0, 0);
  }

  // ==========================================================================
  // INITIALIZATION OF VIRTUAL TEST CELL LAB THREE.JS ENGINE
  // ==========================================================================

  function initLabThreeEngine() {
    if (!window.THREE || !labCanvas || rendererLab) return;

    try {
      const width = labCanvas.clientWidth || 700;
      const height = labCanvas.clientHeight || 450;

      rendererLab = new THREE.WebGLRenderer({
        canvas: labCanvas,
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance'
      });
      rendererLab.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      rendererLab.setSize(width, height, false);
      rendererLab.toneMapping = THREE.ACESFilmicToneMapping;
      rendererLab.toneMappingExposure = 1.35;

      sceneLab = new THREE.Scene();
      cameraLab = new THREE.PerspectiveCamera(34, width / height, 0.1, 100);
      updateLabCamera();

      // Lighting
      const ambientLight = new THREE.AmbientLight(0x283e52, 2.4);
      sceneLab.add(ambientLight);

      const keyLight = new THREE.DirectionalLight(0xffffff, 2.8);
      keyLight.position.set(12, 16, 14);
      sceneLab.add(keyLight);

      const fillLight = new THREE.DirectionalLight(0x00e5ff, 2.2);
      fillLight.position.set(-14, -8, -10);
      sceneLab.add(fillLight);

      const warmGlow = new THREE.DirectionalLight(0xff9900, 1.5);
      warmGlow.position.set(0, -12, 6);
      sceneLab.add(warmGlow);

      rotorGroupLab = new THREE.Group();
      statorGroupLab = new THREE.Group();
      casingGroupLab = new THREE.Group();

      sceneLab.add(rotorGroupLab);
      sceneLab.add(statorGroupLab);
      sceneLab.add(casingGroupLab);

      buildTurbomachineScene(rotorGroupLab, statorGroupLab, casingGroupLab, true);
      particlesMeshLab = initParticles(sceneLab, particlesMeshLab, particlesDataLab);
      shockwaveRingsLab = initShockwaves(sceneLab);

    } catch (err) {
      console.warn('Three.js Lab init failed:', err);
    }
  }

  function updateLabCamera() {
    if (!cameraLab) return;
    const aspect = cameraLab.aspect || 1.0;
    const portraitFactor = aspect < 1.15 ? 1.0 + Math.max(0, 1.15 - aspect) * 0.45 : 1.0;
    const dist = state.labZoomDist * portraitFactor;

    const x = dist * Math.sin(state.labRotY) * Math.cos(state.labRotX);
    const y = dist * Math.sin(state.labRotX);
    const z = dist * Math.cos(state.labRotY) * Math.cos(state.labRotX);
    cameraLab.position.set(x, y, z);
    cameraLab.lookAt(0, 0, 0);
  }

  function applyExplodedView() {
    if (!rotorGroupLab || !statorGroupLab || !casingGroupLab) return;
    const progress = state.labExplodeProgress;

    // Explode rotor stages along Z axis
    STAGES.forEach((stg, idx) => {
      const disc = rotorGroupLab.getObjectByName(`rotorDisc_${idx}`);
      const blades = rotorGroupLab.getObjectByName(`rotorStage_${idx}`);
      const offset = (idx - 1.5) * 2.8 * progress;
      if (disc) disc.position.z = stg.z + offset;
      if (blades) blades.position.z = offset;
    });

    // Explode stators outward
    STATORS.forEach((st, idx) => {
      const stators = statorGroupLab.getObjectByName(`statorStage_${idx}`);
      const offset = (idx - 1.5) * 3.0 * progress;
      if (stators) stators.position.z = offset;
    });

    // Displace casing
    const casing = casingGroupLab.getObjectByName('cutawayCasing');
    const shroud = casingGroupLab.getObjectByName('translucentShroud');
    const casingOffset = 4.2 * progress;
    if (casing) casing.position.x = casingOffset;
    if (shroud) shroud.position.x = -casingOffset;
  }

  // ==========================================================================
  // REAL-TIME 2D CANVAS ENGINES (Performance Map & Velocity Triangles)
  // ==========================================================================

  function drawPerformanceMap(metrics) {
    if (!labPerfMapCanvas) return;
    const ctx = labPerfMapCanvas.getContext('2d');
    if (!ctx) return;

    const w = labPerfMapCanvas.width = labPerfMapCanvas.clientWidth * 2;
    const h = labPerfMapCanvas.height = labPerfMapCanvas.clientHeight * 2;
    ctx.clearRect(0, 0, w, h);

    const padLeft = 70;
    const padBottom = 60;
    const padTop = 30;
    const padRight = 30;

    const plotW = w - padLeft - padRight;
    const plotH = h - padBottom - padTop;

    const maxFlow = 70; // kg/s
    const maxPr = 24;   // Pressure Ratio

    function toX(flow) { return padLeft + (flow / maxFlow) * plotW; }
    function toY(pr) { return padTop + plotH - ((pr - 1.0) / (maxPr - 1.0)) * plotH; }

    // Grid Lines & Axes
    ctx.strokeStyle = 'rgba(0, 229, 255, 0.12)';
    ctx.lineWidth = 1.5;
    ctx.font = 'bold 20px monospace';
    ctx.fillStyle = '#64748b';

    for (let f = 0; f <= maxFlow; f += 10) {
      const x = toX(f);
      ctx.beginPath();
      ctx.moveTo(x, padTop);
      ctx.lineTo(x, padTop + plotH);
      ctx.stroke();
      ctx.fillText(f.toString(), x - 10, padTop + plotH + 28);
    }

    for (let p = 1; p <= maxPr; p += 4) {
      const y = toY(p);
      ctx.beginPath();
      ctx.moveTo(padLeft, y);
      ctx.lineTo(padLeft + plotW, y);
      ctx.stroke();
      ctx.fillText(p.toFixed(0), padLeft - 45, y + 6);
    }

    // Axis Titles
    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 22px Vazirmatn, sans-serif';
    ctx.fillText('دبی جرمی اصلاح‌شده Ṁcorr (kg/s)', padLeft + plotW * 0.35, padTop + plotH + 52);

    ctx.save();
    ctx.translate(22, padTop + plotH * 0.6);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('نسبت تراکم کلی (Πc)', 0, 0);
    ctx.restore();

    // Constant Speed Lines (60%, 75%, 90%, 100%, 105% RPM)
    const speedCurves = [
      { pct: '60%', rpmFrac: 0.60, color: '#38bdf8' },
      { pct: '75%', rpmFrac: 0.75, color: '#00e5ff' },
      { pct: '90%', rpmFrac: 0.90, color: '#2dd4bf' },
      { pct: '100%', rpmFrac: 1.00, color: '#00ff9c' },
      { pct: '105%', rpmFrac: 1.05, color: '#f59e0b' }
    ];

    speedCurves.forEach(sc => {
      ctx.beginPath();
      ctx.strokeStyle = sc.color;
      ctx.lineWidth = 2.5;

      const peakPr = 1.0 + Math.pow(sc.rpmFrac, 2.3) * 20.2;
      const surgeF = 12.0 * sc.rpmFrac;
      const chokeF = 64.0 * sc.rpmFrac;

      for (let f = surgeF; f <= chokeF; f += 2) {
        const xNorm = (f - surgeF) / (chokeF - surgeF);
        // Characteristic compressor speed line curve
        const pr = Math.max(1.0, peakPr * (1.02 - 0.55 * Math.pow(xNorm, 2.2)));
        const px = toX(f);
        const py = toY(pr);
        if (f === surgeF) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();

      // Speed label
      ctx.fillStyle = sc.color;
      ctx.font = 'bold 18px monospace';
      ctx.fillText(sc.pct, toX(chokeF) + 6, toY(peakPr * 0.5));
    });

    // Surge Line (Unstable stall boundary)
    ctx.beginPath();
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 3.5;
    ctx.setLineDash([8, 6]);

    for (let f = 6; f <= 50; f += 2) {
      const pr = 1.2 + 0.34 * f;
      const px = toX(f);
      const py = toY(pr);
      if (f === 6) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = '#ef4444';
    ctx.font = 'bold 20px Vazirmatn, sans-serif';
    ctx.fillText('مرز ناپایداری و سرج (Surge Line)', toX(12), toY(1.2 + 0.34 * 12) - 15);

    // Current Operating Point Dot & Glow
    const opX = toX(metrics.flow);
    const opY = toY(metrics.pr);

    // Pulsing halo
    ctx.beginPath();
    ctx.arc(opX, opY, state.isSurging ? 22 : 14, 0, Math.PI * 2);
    ctx.fillStyle = state.isSurging ? 'rgba(239, 68, 68, 0.4)' : 'rgba(0, 255, 156, 0.3)';
    ctx.fill();

    // Solid core dot
    ctx.beginPath();
    ctx.arc(opX, opY, 7, 0, Math.PI * 2);
    ctx.fillStyle = state.isSurging ? '#ef4444' : '#00ff9c';
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Telemetry Tooltip on dot
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px monospace';
    ctx.fillText(`OP: [${metrics.flow.toFixed(1)} kg/s, Π=${metrics.pr.toFixed(1)}]`, opX + 14, opY - 14);
  }

  function drawVelocityTriangles(m) {
    if (!labVelocityCanvas) return;
    const ctx = labVelocityCanvas.getContext('2d');
    if (!ctx) return;

    const w = labVelocityCanvas.width = labVelocityCanvas.clientWidth * 2;
    const h = labVelocityCanvas.height = labVelocityCanvas.clientHeight * 2;
    ctx.clearRect(0, 0, w, h);

    const scale = 0.42;

    // Inlet Triangle (Left)
    const inOriginX = w * 0.28;
    const inOriginY = h * 0.72;

    // Exit Triangle (Right)
    const exOriginX = w * 0.72;
    const exOriginY = h * 0.72;

    function drawVector(x0, y0, dx, dy, color, label, fontOffset) {
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = 3.0;
      ctx.moveTo(x0, y0);
      ctx.lineTo(x0 + dx, y0 + dy);
      ctx.stroke();

      // Arrow Head
      const angle = Math.atan2(dy, dx);
      ctx.beginPath();
      ctx.fillStyle = color;
      ctx.moveTo(x0 + dx, y0 + dy);
      ctx.lineTo(x0 + dx - 12 * Math.cos(angle - Math.PI / 6), y0 + dy - 12 * Math.sin(angle - Math.PI / 6));
      ctx.lineTo(x0 + dx - 12 * Math.cos(angle + Math.PI / 6), y0 + dy - 12 * Math.sin(angle + Math.PI / 6));
      ctx.fill();

      // Label
      ctx.font = 'bold 20px monospace';
      ctx.fillText(label, x0 + dx * 0.5 + fontOffset.x, y0 + dy * 0.5 + fontOffset.y);
    }

    // 1. INLET TRIANGLE: U1 (horizontal blade speed), C1 (absolute velocity), W1 (relative velocity)
    const u1Len = m.u1 * scale;
    const czLen = -m.cz * 1.4 * scale;
    const cTheta1Len = (m.u1 * 0.2) * scale;

    ctx.fillStyle = '#00e5ff';
    ctx.font = 'bold 24px Vazirmatn, sans-serif';
    ctx.fillText('مثلث سرعت ورود به پره روتور (Inlet)', inOriginX - 100, 45);

    // Blade speed U1
    drawVector(inOriginX, inOriginY, u1Len, 0, '#f59e0b', `U₁=${Math.round(m.u1)} m/s`, { x: -40, y: 26 });
    // Absolute velocity C1
    drawVector(inOriginX, inOriginY, cTheta1Len, czLen, '#00e5ff', `C₁=${Math.round(m.c1)}`, { x: -75, y: -5 });
    // Relative velocity W1
    drawVector(inOriginX + cTheta1Len, inOriginY + czLen, u1Len - cTheta1Len, -czLen, '#00ff9c', `W₁=${Math.round(m.w1)}`, { x: 12, y: -5 });

    // 2. EXIT TRIANGLE: U2, C2, W2
    const u2Len = m.u2 * scale;
    const cTheta2Len = (m.u2 * 0.65) * scale;

    ctx.fillStyle = '#00ff9c';
    ctx.font = 'bold 24px Vazirmatn, sans-serif';
    ctx.fillText('مثلث سرعت خروج از پره روتور (Exit)', exOriginX - 100, 45);

    // Blade speed U2
    drawVector(exOriginX, exOriginY, u2Len, 0, '#f59e0b', `U₂=${Math.round(m.u2)} m/s`, { x: -40, y: 26 });
    // Absolute velocity C2 (with high tangential component)
    drawVector(exOriginX, exOriginY, cTheta2Len, czLen, '#00e5ff', `C₂=${Math.round(m.c2)}`, { x: -75, y: -5 });
    // Relative velocity W2
    drawVector(exOriginX + cTheta2Len, exOriginY + czLen, u2Len - cTheta2Len, -czLen, '#00ff9c', `W₂=${Math.round(m.w2)}`, { x: 12, y: -5 });

    // Euler Work Annotation Banner at bottom
    ctx.fillStyle = 'rgba(0, 229, 255, 0.1)';
    ctx.fillRect(w * 0.1, h - 55, w * 0.8, 42);
    ctx.strokeStyle = 'rgba(0, 229, 255, 0.3)';
    ctx.strokeRect(w * 0.1, h - 55, w * 0.8, 42);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px Vazirmatn, sans-serif';
    ctx.fillText(`معادله توربوماشین اویلر: Δh₀ = U·(Cθ₂ - Cθ₁) = ${m.eulerWork.toFixed(1)} kJ/kg  |  زاویه انحراف جریان: Δβ = ${m.flowDeflection.toFixed(1)}°`, w * 0.14, h - 26);
  }

  // ==========================================================================
  // MAIN ANIMATION LOOP
  // ==========================================================================

  function render(now) {
    requestAnimationFrame(render);

    const dt = Math.min((now - state.lastFrameTime) / 1000, 0.1) * state.labSimSpeed;
    state.lastFrameTime = now;

    // 1. Spool Acceleration / Deceleration
    if (state.isRunning) {
      if (state.isBoosted) {
        state.targetRpm = state.maxRpm;
      } else {
        state.targetRpm = state.idleRpm + (state.throttle / 100) * (19500 - state.idleRpm);
      }
    } else {
      state.targetRpm = 0;
    }

    const accelRate = state.targetRpm > state.rpm ? 5.2 : 2.8;
    state.rpm += (state.targetRpm - state.rpm) * Math.min(1, dt * accelRate);
    if (state.rpm < 50 && !state.isRunning) state.rpm = 0;

    const rpmFrac = Math.max(0, Math.min(1, state.rpm / state.maxRpm));

    // Rotation increment
    const rotSpeed = (state.rpm / 60) * 0.14 * (Math.PI * 2);
    state.angle += rotSpeed * dt;

    // Aerodynamics & Telemetry
    const metrics = calculateAerodynamics();
    const sensorJitter = (Math.random() - 0.5) * (state.rpm * 0.005);
    updateTelemetry(metrics, sensorJitter);
    updateAudioParams();

    // 2. Render Hero 3D WebGL
    if (state.inViewport && state.useWebGL && rendererHero && sceneHero && cameraHero) {
      if (!state.isDragging) {
        state.targetRotY += dt * 0.14 * (0.4 + 0.6 * rpmFrac);
      }
      state.rotX += (state.targetRotX - state.rotX) * Math.min(1, dt * 9.0);
      state.rotY += (state.targetRotY - state.rotY) * Math.min(1, dt * 9.0);
      state.zoomDist += (state.targetZoomDist - state.zoomDist) * Math.min(1, dt * 8.0);
      updateHeroCamera();

      if (rotorGroupHero) {
        rotorGroupHero.rotation.z = state.angle;
      }
      updateParticles(particlesMeshHero, particlesDataHero, dt, rpmFrac);
      updateShockwaves(shockwaveRingsHero, dt, rpmFrac);
      rendererHero.render(sceneHero, cameraHero);
    }

    // 3. Render Virtual Test Cell Lab 3D WebGL (if modal open)
    if (state.isLabOpen && rendererLab && sceneLab && cameraLab) {
      if (!state.labIsDragging) {
        state.labTargetRotY += dt * 0.12 * (0.3 + 0.7 * rpmFrac);
      }
      state.labRotX += (state.labTargetRotX - state.labRotX) * Math.min(1, dt * 9.0);
      state.labRotY += (state.labTargetRotY - state.labRotY) * Math.min(1, dt * 9.0);
      state.labZoomDist += (state.labTargetZoomDist - state.labZoomDist) * Math.min(1, dt * 8.0);
      updateLabCamera();

      if (rotorGroupLab) {
        rotorGroupLab.rotation.z = state.angle;
      }
      applyExplodedView();
      updateParticles(particlesMeshLab, particlesDataLab, dt, rpmFrac);
      updateShockwaves(shockwaveRingsLab, dt, rpmFrac);
      rendererLab.render(sceneLab, cameraLab);

      // 4. Render 2D Lab Charts
      if (state.activeLabTab === 'perf') {
        drawPerformanceMap(metrics);
      } else if (state.activeLabTab === 'euler') {
        drawVelocityTriangles(metrics);
      }
    }
  }

  // ==========================================================================
  // EVENT HANDLERS & PUBLIC API CONTROLS
  // ==========================================================================

  window.toggleCompressorEngine = function (ev) {
    if (ev) ev.stopPropagation();
    state.isRunning = !state.isRunning;

    if (powerBtn) {
      powerBtn.classList.toggle('active', state.isRunning);
      if (powerText) powerText.textContent = state.isRunning ? 'روشن' : 'خاموش';
    }
    if (boostBtn && !state.isRunning) {
      boostBtn.classList.remove('active');
      state.isBoosted = false;
    }
  };

  window.boostCompressorEngine = function (ev) {
    if (ev) ev.stopPropagation();
    if (!state.isRunning) {
      state.isRunning = true;
      if (powerBtn) powerBtn.classList.add('active');
      if (powerText) powerText.textContent = 'روشن';
    }
    state.isBoosted = !state.isBoosted;
    if (boostBtn) boostBtn.classList.toggle('active', state.isBoosted);
    if (stageEl) stageEl.setAttribute('data-state', state.isBoosted ? 'boosted' : 'running');
  };

  window.cycleCompressorMode = function (ev) {
    if (ev) ev.stopPropagation();
    state.modeIndex = (state.modeIndex + 1) % state.modes.length;
    state.viewMode = state.modes[state.modeIndex];

    if (modeText) modeText.textContent = state.modeLabels[state.viewMode];
    applyViewMode(state.viewMode);
  };

  function applyViewMode(mode) {
    state.viewMode = mode;
    const isWire = (mode === 'cad');
    const useColors = (mode === 'mechanical');

    function applyToRotor(group) {
      if (!group) return;
      group.children.forEach(child => {
        if (child.isInstancedMesh && child.name.startsWith('rotorStage')) {
          child.material.wireframe = isWire;
          child.material.vertexColors = useColors;
          if (mode === 'thermal') {
            child.material.color.setHex(0xf59e0b);
            child.material.emissive.setHex(0xd97706);
          } else if (mode === 'mechanical') {
            child.material.color.setHex(0xffffff);
            child.material.emissive.setHex(0x0284c7);
          } else if (mode === 'cad') {
            child.material.color.setHex(0x00e5ff);
          } else {
            child.material.color.setHex(0xc2d1e0);
            child.material.emissive.setHex(0x061e2e);
          }
          child.material.needsUpdate = true;
        }
      });
    }

    applyToRotor(rotorGroupHero);
    applyToRotor(rotorGroupLab);
  }

  window.toggleCompressorAudio = function (ev) {
    if (ev) ev.stopPropagation();
    initAudio();
    if (!state.audioCtx) return;

    if (state.audioCtx.state === 'suspended') {
      state.audioCtx.resume();
    }
    state.isAudioActive = !state.isAudioActive;
    if (soundBtn) soundBtn.classList.toggle('active', state.isAudioActive);
    if (soundIcon) {
      soundIcon.setAttribute('data-lucide', state.isAudioActive ? 'volume-2' : 'volume-x');
      if (window.lucide) lucide.createIcons();
    }
  };

  window.setCompressorThrottle = function (val) {
    state.throttle = Math.max(0, Math.min(100, parseInt(val, 10)));
    if (throttlePercentEl) throttlePercentEl.textContent = state.throttle + '%';
    const labRpmVal = document.getElementById('labRpmSliderVal');
    if (labRpmVal) labRpmVal.textContent = state.throttle + '%';
    const labRpmSlider = document.getElementById('labRpmSlider');
    if (labRpmSlider && labRpmSlider.value !== val) labRpmSlider.value = state.throttle;
  };

  window.setCompressorCameraPreset = function (preset, ev) {
    if (ev) ev.stopPropagation();
    state.cameraPreset = preset;

    if (preset === 'iso') {
      state.targetRotX = 0.28;
      state.targetRotY = 0.68;
      state.targetZoomDist = 21.0;
    } else if (preset === 'cutaway' || preset === 'side') {
      state.targetRotX = 0.05;
      state.targetRotY = Math.PI * 0.5;
      state.targetZoomDist = 20.0;
    } else if (preset === 'front') {
      state.targetRotX = 0.0;
      state.targetRotY = 0.0;
      state.targetZoomDist = 19.5;
    } else if (preset === 'aft') {
      state.targetRotX = 0.0;
      state.targetRotY = Math.PI;
      state.targetZoomDist = 19.5;
    }

    [camBtnIso, camBtnCutaway, camBtnFront, camBtnAft].forEach(b => {
      if (b) b.classList.remove('active');
    });
    if (preset === 'iso' && camBtnIso) camBtnIso.classList.add('active');
    if ((preset === 'cutaway' || preset === 'side') && camBtnCutaway) camBtnCutaway.classList.add('active');
    if (preset === 'front' && camBtnFront) camBtnFront.classList.add('active');
    if (preset === 'aft' && camBtnAft) camBtnAft.classList.add('active');

    dismissHint();
  };

  function dismissHint() {
    if (hintBadge && !hintBadge.classList.contains('hidden')) {
      hintBadge.classList.add('hidden');
    }
  }

  // --- Turbomachinery Virtual Test Cell Modal Functions ---
  window.openTurbomachineLab = function (ev) {
    if (ev) ev.stopPropagation();
    if (!labModal) labModal = document.getElementById('turbomachineryLabModal');
    if (!labModal) return;

    labModal.classList.add('open');
    labModal.setAttribute('aria-hidden', 'false');
    state.isLabOpen = true;

    setTimeout(() => {
      initLabThreeEngine();
      onResize();
      if (window.lucide) lucide.createIcons();
    }, 60);
  };

  window.closeTurbomachineLab = function () {
    if (!labModal) labModal = document.getElementById('turbomachineryLabModal');
    if (!labModal) return;
    labModal.classList.remove('open');
    labModal.setAttribute('aria-hidden', 'true');
    state.isLabOpen = false;
  };

  window.switchLabTab = function (tabName) {
    state.activeLabTab = tabName;
    ['perf', 'euler', 'stages', 'fluid'].forEach(t => {
      const btn = document.getElementById(`tabBtn${t.charAt(0).toUpperCase() + t.slice(1)}`);
      const panel = document.getElementById(`tabPanel${t.charAt(0).toUpperCase() + t.slice(1)}`);
      if (btn) btn.classList.toggle('active', t === tabName);
      if (panel) panel.classList.toggle('active', t === tabName);
    });
    if (window.lucide) lucide.createIcons();
  };

  window.setLabViewMode = function (mode) {
    ['cfd', 'mechanical', 'thermal', 'cad'].forEach(m => {
      const btn = document.getElementById(`labMode${m.charAt(0).toUpperCase() + m.slice(1, 4)}`);
      if (btn) btn.classList.toggle('active', m === mode);
    });
    applyViewMode(mode);
  };

  window.setLabCameraPreset = function (preset) {
    if (preset === 'iso') {
      state.labTargetRotX = 0.26;
      state.labTargetRotY = 0.72;
      state.labTargetZoomDist = 22.0;
    } else if (preset === 'cutaway' || preset === 'side') {
      state.labTargetRotX = 0.05;
      state.labTargetRotY = Math.PI * 0.5;
      state.labTargetZoomDist = 21.0;
    } else if (preset === 'front') {
      state.labTargetRotX = 0.0;
      state.labTargetRotY = 0.0;
      state.labTargetZoomDist = 20.5;
    } else if (preset === 'aft') {
      state.labTargetRotX = 0.0;
      state.labTargetRotY = Math.PI;
      state.labTargetZoomDist = 20.5;
    }
  };

  window.setLabExplodedView = function (val) {
    state.labExplodeProgress = parseFloat(val) / 100;
    const el = document.getElementById('labExplodeVal');
    if (el) el.textContent = val + '%';
  };

  window.setLabCutawayAngle = function (val) {
    state.labCutawayAngleDeg = parseInt(val, 10);
    const el = document.getElementById('labCutawayVal');
    if (el) el.textContent = val + '°';
  };

  window.setLabSimSpeed = function (val) {
    state.labSimSpeed = parseFloat(val) / 100;
    const el = document.getElementById('labSpeedVal');
    if (el) el.textContent = (state.labSimSpeed).toFixed(1) + 'x';
  };

  window.toggleLabWireframe = function (checked) {
    state.labWireframe = checked;
    if (rotorGroupLab) {
      rotorGroupLab.children.forEach(c => {
        if (c.isInstancedMesh) c.material.wireframe = checked;
      });
    }
  };

  window.setLabBackPressure = function (val) {
    state.backPressureValve = parseInt(val, 10);
    const el = document.getElementById('labValveVal');
    if (el) el.textContent = val + '%';
  };

  window.setLabWorkingFluid = function (fluid) {
    state.workingFluid = fluid;
    if (fluid === 'air') {
      state.fluidGamma = 1.40;
      state.fluidR = 287.05;
    } else if (fluid === 'sco2') {
      state.fluidGamma = 1.28;
      state.fluidR = 188.92;
    } else if (fluid === 'ch4') {
      state.fluidGamma = 1.32;
      state.fluidR = 518.3;
    } else if (fluid === 'n2') {
      state.fluidGamma = 1.40;
      state.fluidR = 296.8;
    }
  };

  window.setLabAmbTemp = function (val) {
    state.inletTempC = parseInt(val, 10);
    const el = document.getElementById('labAmbTempVal');
    if (el) el.textContent = (val > 0 ? '+' : '') + val + ' °C';
  };

  window.setLabAltitude = function (val) {
    state.altitudeM = parseInt(val, 10);
    const pAmb = (101.325 * Math.pow(1 - 0.0225577 * (state.altitudeM / 1000), 5.25588)).toFixed(1);
    const el = document.getElementById('labAltitudeVal');
    if (el) el.textContent = val + ' m (' + pAmb + ' kPa)';
  };

  window.setLabVigvAngle = function (val) {
    state.vigvAngleDeg = parseInt(val, 10);
    const el = document.getElementById('labVigvVal');
    if (el) el.textContent = (val > 0 ? '+' : '') + val + '°';
  };

  window.applyLabFlightPreset = function (preset) {
    if (preset === 'sealevel') {
      window.setLabAltitude(0);
      window.setLabAmbTemp(15);
      window.setLabVigvAngle(0);
    } else if (preset === 'cruise') {
      window.setLabAltitude(10000);
      window.setLabAmbTemp(-50);
      window.setLabVigvAngle(5);
    } else if (preset === 'hotandhigh') {
      window.setLabAltitude(2500);
      window.setLabAmbTemp(45);
      window.setLabVigvAngle(-10);
    }
  };

  // Automated Test Sweep
  window.runTurbomachineSweepTest = function () {
    if (state.isSweepRunning) return;
    state.isSweepRunning = true;
    state.isRunning = true;
    if (powerBtn) powerBtn.classList.add('active');

    let currentThrottle = 0;
    const interval = setInterval(() => {
      currentThrottle += 2;
      window.setCompressorThrottle(currentThrottle);
      const input = document.getElementById('compressorThrottleInput');
      if (input) input.value = currentThrottle;

      if (currentThrottle >= 100) {
        clearInterval(interval);
        state.isSweepRunning = false;
      }
    }, 100);
  };

  // CSV Telemetry Export
  window.exportTurbomachineDataCsv = function () {
    const metrics = calculateAerodynamics();
    let csv = "FluidMind Turbomachinery Digital Twin - Test Data Report\n";
    csv += "Date," + new Date().toISOString() + "\n";
    csv += "RPM," + Math.round(state.rpm) + "\n";
    csv += "Working Fluid," + state.workingFluid + "\n";
    csv += "Pressure Ratio (Pi_c)," + metrics.pr.toFixed(2) + "\n";
    csv += "Mass Flow (kg/s)," + metrics.flow.toFixed(2) + "\n";
    csv += "Exit Temperature (C)," + metrics.t2.toFixed(1) + "\n";
    csv += "Isentropic Efficiency," + (metrics.eff * 100).toFixed(2) + "%\n";
    csv += "Surge Margin," + metrics.surgeMargin.toFixed(1) + "%\n";
    csv += "Shaft Power (MW)," + metrics.power.toFixed(2) + "\n";
    csv += "Euler Work (kJ/kg)," + metrics.eulerWork.toFixed(2) + "\n\n";

    csv += "Stage,Blade Count,Tip Mach,Stage PR,Delta T (C),Centrifugal Stress (MPa)\n";
    csv += "Stage 1 (LP),20,1.12,2.15,+62,284\n";
    csv += "Stage 2 (IP),24,0.94,2.28,+84,235\n";
    csv += "Stage 3 (HP),28,0.78,2.35,+112,192\n";
    csv += "Stage 4 (Diffuser),32,0.62,1.60,+136,155\n";

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `turbocompressor_test_${Math.round(state.rpm)}rpm.csv`;
    link.click();
  };

  // ==========================================================================
  // POINTER & TOUCH ORBIT CONTROLS
  // ==========================================================================

  function setupOrbitControls() {
    let heroPinchStartDist = 0;
    let heroPinchStartZoom = state.zoomDist;
    let labPinchStartDist = 0;
    let labPinchStartZoom = state.labZoomDist;

    // Hero Canvas Controls
    if (heroCanvas) {
      heroCanvas.addEventListener('mousedown', (e) => {
        state.isDragging = true;
        state.dragStartX = e.clientX;
        state.dragStartY = e.clientY;
        state.velX = 0;
        state.velY = 0;
        if (stageEl) stageEl.classList.add('is-dragging');
        dismissHint();
      });

      heroCanvas.addEventListener('touchstart', (e) => {
        if (e.touches.length === 1) {
          state.isDragging = true;
          state.dragStartX = e.touches[0].clientX;
          state.dragStartY = e.touches[0].clientY;
          heroPinchStartDist = 0;
        } else if (e.touches.length >= 2) {
          state.isDragging = false;
          heroPinchStartDist = Math.hypot(
            e.touches[0].clientX - e.touches[1].clientX,
            e.touches[0].clientY - e.touches[1].clientY
          );
          heroPinchStartZoom = state.targetZoomDist;
        }
        dismissHint();
      }, { passive: true });

      heroCanvas.addEventListener('wheel', (e) => {
        e.preventDefault();
        state.targetZoomDist = Math.max(11.0, Math.min(32.0, state.targetZoomDist + e.deltaY * 0.015));
      }, { passive: false });
    }

    // Lab Canvas Controls
    if (labCanvas) {
      labCanvas.addEventListener('mousedown', (e) => {
        state.labIsDragging = true;
        state.labDragStartX = e.clientX;
        state.labDragStartY = e.clientY;
      });

      labCanvas.addEventListener('touchstart', (e) => {
        if (e.touches.length === 1) {
          state.labIsDragging = true;
          state.labDragStartX = e.touches[0].clientX;
          state.labDragStartY = e.touches[0].clientY;
          labPinchStartDist = 0;
        } else if (e.touches.length >= 2) {
          state.labIsDragging = false;
          labPinchStartDist = Math.hypot(
            e.touches[0].clientX - e.touches[1].clientX,
            e.touches[0].clientY - e.touches[1].clientY
          );
          labPinchStartZoom = state.labTargetZoomDist;
        }
      }, { passive: true });

      labCanvas.addEventListener('wheel', (e) => {
        e.preventDefault();
        state.labTargetZoomDist = Math.max(12.0, Math.min(36.0, state.labTargetZoomDist + e.deltaY * 0.018));
      }, { passive: false });
    }

    // Global Window Move & Up
    window.addEventListener('mousemove', (e) => {
      if (state.isDragging) {
        const dx = e.clientX - state.dragStartX;
        const dy = e.clientY - state.dragStartY;
        state.dragStartX = e.clientX;
        state.dragStartY = e.clientY;
        state.targetRotY += dx * 0.007;
        state.targetRotX = Math.max(-Math.PI * 0.42, Math.min(Math.PI * 0.42, state.targetRotX - dy * 0.007));
      }
      if (state.labIsDragging) {
        const dx = e.clientX - state.labDragStartX;
        const dy = e.clientY - state.labDragStartY;
        state.labDragStartX = e.clientX;
        state.labDragStartY = e.clientY;
        state.labTargetRotY += dx * 0.007;
        state.labTargetRotX = Math.max(-Math.PI * 0.42, Math.min(Math.PI * 0.42, state.labTargetRotX - dy * 0.007));
      }
    });

    window.addEventListener('touchmove', (e) => {
      if (!e.touches[0]) return;
      if (e.touches.length >= 2) {
        if (heroPinchStartDist > 0) {
          const currentDist = Math.hypot(
            e.touches[0].clientX - e.touches[1].clientX,
            e.touches[0].clientY - e.touches[1].clientY
          );
          if (currentDist > 8) {
            const factor = heroPinchStartDist / currentDist;
            state.targetZoomDist = Math.max(12.0, Math.min(34.0, heroPinchStartZoom * factor));
          }
        }
        if (labPinchStartDist > 0) {
          const currentDist = Math.hypot(
            e.touches[0].clientX - e.touches[1].clientX,
            e.touches[0].clientY - e.touches[1].clientY
          );
          if (currentDist > 8) {
            const factor = labPinchStartDist / currentDist;
            state.labTargetZoomDist = Math.max(12.0, Math.min(36.0, labPinchStartZoom * factor));
          }
        }
        return;
      }
      if (state.isDragging) {
        const dx = e.touches[0].clientX - state.dragStartX;
        const dy = e.touches[0].clientY - state.dragStartY;
        state.dragStartX = e.touches[0].clientX;
        state.dragStartY = e.touches[0].clientY;
        state.targetRotY += dx * 0.007;
        state.targetRotX = Math.max(-Math.PI * 0.42, Math.min(Math.PI * 0.42, state.targetRotX - dy * 0.007));
      }
      if (state.labIsDragging) {
        const dx = e.touches[0].clientX - state.labDragStartX;
        const dy = e.touches[0].clientY - state.labDragStartY;
        state.labDragStartX = e.touches[0].clientX;
        state.labDragStartY = e.touches[0].clientY;
        state.labTargetRotY += dx * 0.007;
        state.labTargetRotX = Math.max(-Math.PI * 0.42, Math.min(Math.PI * 0.42, state.labTargetRotX - dy * 0.007));
      }
    }, { passive: true });

    window.addEventListener('mouseup', () => {
      state.isDragging = false;
      state.labIsDragging = false;
      if (stageEl) stageEl.classList.remove('is-dragging');
    });

    window.addEventListener('touchend', () => {
      state.isDragging = false;
      state.labIsDragging = false;
      heroPinchStartDist = 0;
      labPinchStartDist = 0;
      if (stageEl) stageEl.classList.remove('is-dragging');
    });
  }

  // --- Resize Handler ---
  function onResize() {
    if (heroCanvas && rendererHero && cameraHero) {
      const width = heroCanvas.clientWidth || 480;
      const height = heroCanvas.clientHeight || 380;
      cameraHero.aspect = width / height;
      cameraHero.updateProjectionMatrix();
      rendererHero.setSize(width, height, false);
    }
    if (labCanvas && rendererLab && cameraLab) {
      const width = labCanvas.clientWidth || 700;
      const height = labCanvas.clientHeight || 450;
      cameraLab.aspect = width / height;
      cameraLab.updateProjectionMatrix();
      rendererLab.setSize(width, height, false);
    }
  }

  // ==========================================================================
  // INITIALIZATION & LIFECYCLE
  // ==========================================================================

  function init() {
    stageEl = document.getElementById('heroCompressorStage');
    heroCanvas = document.getElementById('heroCompressorCanvas');
    labModal = document.getElementById('turbomachineryLabModal');
    labCanvas = document.getElementById('labCompressorCanvas');
    hintBadge = document.getElementById('compressor3dHint');

    statusLabelEl = document.getElementById('compressorStatusLabel');
    rpmDisplayEl = document.getElementById('compressorRpmDisplay');
    prDisplayEl = document.getElementById('compressorPrDisplay');
    flowDisplayEl = document.getElementById('compressorFlowDisplay');
    tempDisplayEl = document.getElementById('compressorTempDisplay');
    effDisplayEl = document.getElementById('compressorEffDisplay');

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
    camBtnAft = document.getElementById('btnCamAft');

    labPerfMapCanvas = document.getElementById('labPerfMapCanvas');
    labVelocityCanvas = document.getElementById('labVelocityTrianglesCanvas');
    labSurgeAlert = document.getElementById('labSurgeAlertBanner');

    if (!heroCanvas) return;

    // 1. Initialize Hero 3D WebGL
    initHeroThreeEngine();

    // 2. Setup Orbit Events
    setupOrbitControls();

    // 3. Resize Observers
    window.addEventListener('resize', onResize);
    if (window.ResizeObserver && stageEl) {
      new ResizeObserver(onResize).observe(stageEl);
    }

    // 4. Viewport Intersection Observer
    if ('IntersectionObserver' in window && stageEl) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          state.inViewport = entry.isIntersecting;
        });
      }, { threshold: 0.1 });
      observer.observe(stageEl);
    }

    // 5. Dismiss Hint
    setTimeout(dismissHint, 5000);

    // Refresh Lucide Icons
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      try { window.lucide.createIcons(); } catch (err) {}
    }

    // 6. Start Render Loop
    requestAnimationFrame(render);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
