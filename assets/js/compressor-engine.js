/**
 * ============================================================================
 * Turbomachine & Axial Compressor Dynamic Simulation Engine
 * FluidMind // Mohammadamin Sharif - Mechanical Engineering
 * 
 * Features:
 * - Real-time 60FPS multi-stage axial rotor rotation with aerodynamic aerofoil blades
 * - Compressible CFD fluid particle streamlines (Inlet -> Compression -> Discharge)
 * - Dynamic Euler turbomachinery velocity vectors and pressure shockwaves
 * - Real-time interactive controls: Start/Stop, Turbo Boost (24,000 RPM), Throttle Slider
 * - Four visualization modes: CFD Flow, Mechanical Stress, Thermal Map, CAD Blueprint
 * - Standalone Web Audio API Jet Engine Synthesizer (blade-pass whistle & air roar)
 * - Micro-mechanical vibration simulation and real-time sensor telemetry
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
    particles: [],
    shockwaves: [],
    scannerX: 0,
    scannerDir: 1,
    inViewport: true
  };

  // --- DOM Elements Cache ---
  let stageEl, canvas, ctx, imgEl;
  let statusLabelEl, rpmDisplayEl, prDisplayEl, flowDisplayEl, tempDisplayEl;
  let powerBtn, powerText, boostBtn, modeBtn, modeText, soundBtn, soundText, soundIcon;
  let throttleInput, throttlePercentEl;

  // Track Theme (Dark / Light)
  let isDarkMode = true;

  function updateThemeState() {
    isDarkMode = document.documentElement.classList.contains('dark-mode') ||
                 document.body.classList.contains('dark-mode') ||
                 !document.body.classList.contains('light-mode');
  }

  // --- Particle System for CFD Aerodynamic Streamlines ---
  const PARTICLE_COUNT = 48;

  function initParticles(width, height) {
    state.particles = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      state.particles.push(createParticle(width, height, true));
    }
  }

  function createParticle(w, h, randomProgress = false) {
    // Flow travels horizontally from intake to exhaust through the compressor
    const progress = randomProgress ? Math.random() : 0;
    const ySpread = (Math.random() - 0.5) * h * 0.72;
    return {
      x: w * progress,
      baseY: h * 0.52 + ySpread,
      y: h * 0.52 + ySpread,
      speed: 1.8 + Math.random() * 2.2,
      size: 1.2 + Math.random() * 2.4,
      seed: Math.random() * Math.PI * 2,
      trail: [],
      maxTrail: 5 + Math.floor(Math.random() * 5),
      opacity: 0.2 + Math.random() * 0.8
    };
  }

  // --- Initialize Web Audio API Jet Engine Synthesizer ---
  function initAudio() {
    if (state.audioCtx) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      state.audioCtx = new AudioContext();

      // Master Gain
      state.audioGain = state.audioCtx.createGain();
      state.audioGain.gain.setValueAtTime(0.0001, state.audioCtx.currentTime);
      state.audioGain.connect(state.audioCtx.destination);

      // 1. High-Pitch Blade-Pass Frequency Whine (Sine wave)
      state.whineOsc = state.audioCtx.createOscillator();
      state.whineOsc.type = 'sine';
      state.whineOsc.frequency.setValueAtTime(800, state.audioCtx.currentTime);

      const whineGain = state.audioCtx.createGain();
      whineGain.gain.setValueAtTime(0.12, state.audioCtx.currentTime);
      state.whineOsc.connect(whineGain);
      whineGain.connect(state.audioGain);
      state.whineOsc.start();

      // 2. Low-Frequency Mechanical Shaft Rumble (Sawtooth with Low-Pass)
      state.rumbleOsc = state.audioCtx.createOscillator();
      state.rumbleOsc.type = 'triangle';
      state.rumbleOsc.frequency.setValueAtTime(65, state.audioCtx.currentTime);

      const rumbleFilter = state.audioCtx.createBiquadFilter();
      rumbleFilter.type = 'lowpass';
      rumbleFilter.frequency.setValueAtTime(140, state.audioCtx.currentTime);

      const rumbleGain = state.audioCtx.createGain();
      rumbleGain.gain.setValueAtTime(0.18, state.audioCtx.currentTime);
      state.rumbleOsc.connect(rumbleFilter);
      rumbleFilter.connect(rumbleGain);
      rumbleGain.connect(state.audioGain);
      state.rumbleOsc.start();

      // 3. Turbulent Aerodynamic Airflow Noise (Buffer + Bandpass)
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
        output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
        output[i] *= 0.11;
        b6 = white * 0.115926;
      }

      state.noiseNode = state.audioCtx.createBufferSource();
      state.noiseNode.buffer = noiseBuffer;
      state.noiseNode.loop = true;

      state.noiseFilter = state.audioCtx.createBiquadFilter();
      state.noiseFilter.type = 'bandpass';
      state.noiseFilter.frequency.setValueAtTime(1200, state.audioCtx.currentTime);
      state.noiseFilter.Q.setValueAtTime(1.4, state.audioCtx.currentTime);

      const noiseGain = state.audioCtx.createGain();
      noiseGain.gain.setValueAtTime(0.25, state.audioCtx.currentTime);

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

    // Audible gain when active
    const targetGain = 0.24 * (0.4 + 0.6 * rpmFrac);
    state.audioGain.gain.setTargetAtTime(targetGain, now, 0.08);

    // Whine frequency scales with RPM (500Hz - 1900Hz)
    if (state.whineOsc) {
      const whineFreq = 420 + rpmFrac * 1480;
      state.whineOsc.frequency.setTargetAtTime(whineFreq, now, 0.06);
    }

    // Low rumble frequency scales with RPM (40Hz - 110Hz)
    if (state.rumbleOsc) {
      const rumbleFreq = 40 + rpmFrac * 70;
      state.rumbleOsc.frequency.setTargetAtTime(rumbleFreq, now, 0.06);
    }

    // Noise filter bandpass tracks high-velocity airflow
    if (state.noiseFilter) {
      const filterFreq = 800 + rpmFrac * 2200;
      state.noiseFilter.frequency.setTargetAtTime(filterFreq, now, 0.06);
    }
  }

  // --- Dynamic Telemetry Calculations ---
  function updateTelemetry(jitter) {
    if (!statusLabelEl || !rpmDisplayEl) return;

    // Display RPM with authentic sensor fluctuation
    const displayRpm = Math.max(0, Math.round(state.rpm + (state.rpm > 500 ? jitter : 0)));
    rpmDisplayEl.textContent = displayRpm.toLocaleString('en-US') + ' RPM';

    // Pressure Ratio: Pi_c = 1 + (rpm/maxRpm)^2.3 * 22
    const frac = state.rpm / state.maxRpm;
    const pr = state.rpm > 300 ? (1.0 + Math.pow(frac, 2.3) * 21.5).toFixed(1) : '1.0';
    if (prDisplayEl) prDisplayEl.textContent = pr + ':1';

    // Mass Flow Rate: Ṁ = (rpm/maxRpm) * 62.4 kg/s
    const flow = state.rpm > 300 ? (frac * 62.4).toFixed(1) : '0.0';
    if (flowDisplayEl) flowDisplayEl.textContent = flow + ' kg/s';

    // Exit Temp: T_2 = 24 + frac^1.8 * 440 °C
    const temp = state.rpm > 300 ? Math.round(24 + Math.pow(frac, 1.8) * 440) : 24;
    if (tempDisplayEl) tempDisplayEl.textContent = temp + '°C';

    // Update Status Badge
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

  // --- Main Render Loop ---
  function render(now) {
    requestAnimationFrame(render);

    if (!state.inViewport || !canvas || !ctx) return;

    const dt = Math.min((now - state.lastFrameTime) / 1000, 0.1);
    state.lastFrameTime = now;

    // --- Physics / RPM Inertia ---
    if (state.isRunning) {
      if (state.isBoosted) {
        state.targetRpm = state.maxRpm;
      } else {
        // Linear mapping from throttle 0-100% to idle-nominal RPM
        state.targetRpm = state.idleRpm + (state.throttle / 100) * (19500 - state.idleRpm);
      }
    } else {
      state.targetRpm = 0;
    }

    // Smooth inertia acceleration / spool-down curve
    const accelRate = state.targetRpm > state.rpm ? 4.5 : 2.8; // Spools up faster than down
    state.rpm += (state.targetRpm - state.rpm) * Math.min(1, dt * accelRate);
    if (state.rpm < 50 && !state.isRunning) state.rpm = 0;

    // Rotation increment based on current RPM
    // At 18,000 RPM = 300 rev/sec. We scale visually so blades are discernibly rotating with motion trails
    const visualRotSpeed = (state.rpm / 60) * 0.09 * (2 * Math.PI);
    state.angle += visualRotSpeed * dt;

    // Random sensor jitter for realistic digital telemetry
    const sensorJitter = (Math.random() - 0.5) * (state.rpm * 0.008);
    updateTelemetry(sensorJitter);
    updateAudioParams();

    // Canvas Dimensions
    const w = canvas.width;
    const h = canvas.height;
    if (w === 0 || h === 0) return;

    ctx.clearRect(0, 0, w, h);

    // Dynamic Center of the Compressor
    const cx = w * 0.50;
    const cy = h * 0.50;
    const radius = Math.min(w, h) * 0.44;

    // 1. Draw Background CFD Aerodynamic Streamlines & Particle Trails
    drawFluidStreamlines(ctx, w, h, cx, cy, dt);

    // 2. Draw Compressible Shockwave Pulses
    drawShockwaves(ctx, cx, cy, radius, dt);

    // 3. Draw Axial Compressor Multi-Stage Rotor & Aerofoil Blades
    drawCompressorRotor(ctx, cx, cy, radius);

    // 4. Draw Diagnostic Mode Overlays (CAD Scanning / Stress / Thermal)
    drawDiagnosticOverlay(ctx, w, h, cx, cy, radius, dt);
  }

  // --- 1. Draw Aerodynamic Fluid Streamlines ---
  function drawFluidStreamlines(ctx, w, h, cx, cy, dt) {
    const rpmFrac = Math.max(0.05, state.rpm / state.maxRpm);

    ctx.save();

    state.particles.forEach((p) => {
      // Advance particle position
      const velocity = p.speed * (0.4 + rpmFrac * 2.8);
      p.x += velocity;

      // Suction curve: fluid is drawn toward the compressor center
      const dx = p.x - cx;
      const suctionStrength = Math.exp(-Math.pow(dx / (w * 0.35), 2)) * (h * 0.08) * rpmFrac;
      const wave = Math.sin(p.x * 0.02 + p.seed + state.angle * 2) * (h * 0.02);
      p.y = p.baseY + (cy - p.baseY) * (suctionStrength / (h * 0.5)) + wave;

      // Maintain motion trail
      p.trail.unshift({ x: p.x, y: p.y });
      if (p.trail.length > p.maxTrail) p.trail.pop();

      // Reset when exiting boundary
      if (p.x > w + 20) {
        Object.assign(p, createParticle(w, h, false));
      }

      // Draw particle trail
      if (p.trail.length > 1) {
        ctx.beginPath();
        ctx.moveTo(p.trail[0].x, p.trail[0].y);
        for (let i = 1; i < p.trail.length; i++) {
          ctx.lineTo(p.trail[i].x, p.trail[i].y);
        }

        // Color transition: cold blue at intake (left) -> bright cyan -> compressed gold/emerald (right)
        const progressX = Math.max(0, Math.min(1, p.x / w));
        let strokeColor;

        if (state.viewMode === 'thermal') {
          // Cold blue (290K) to fiery orange (720K)
          const r = Math.round(20 + progressX * 235);
          const g = Math.round(180 - progressX * 80);
          const b = Math.round(255 - progressX * 220);
          strokeColor = `rgba(${r}, ${g}, ${b}, ${p.opacity * 0.8})`;
        } else if (state.viewMode === 'mechanical') {
          // Structural green / cyan
          strokeColor = `rgba(0, 255, 180, ${p.opacity * (0.3 + 0.7 * progressX)})`;
        } else {
          // Standard CFD: Cold Cyan -> Energized Emerald
          const g = Math.round(229 + progressX * 26);
          const b = Math.round(255 - progressX * 99);
          strokeColor = `rgba(0, ${g}, ${b}, ${p.opacity * (0.3 + 0.7 * progressX)})`;
        }

        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = p.size * (0.8 + 0.6 * progressX);
        ctx.lineCap = 'round';
        ctx.stroke();
      }

      // Particle head glow
      if (state.rpm > 1200) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 0.8, 0, Math.PI * 2);
        ctx.fillStyle = state.viewMode === 'thermal' ? '#ff9e2c' : '#00ffcc';
        ctx.fill();
      }
    });

    ctx.restore();
  }

  // --- 2. Draw Compressible Shockwave Pulses ---
  function drawShockwaves(ctx, cx, cy, radius, dt) {
    if (state.rpm < 2000) return;

    // Periodically spawn shockwave rings based on RPM
    if (!state._lastShockwave || performance.now() - state._lastShockwave > (140000 / state.rpm)) {
      state.shockwaves.push({ r: radius * 0.25, alpha: 0.7, maxR: radius * 1.35 });
      state._lastShockwave = performance.now();
    }

    ctx.save();
    for (let i = state.shockwaves.length - 1; i >= 0; i--) {
      const sw = state.shockwaves[i];
      sw.r += (radius * 1.8) * dt * (state.rpm / state.maxRpm);
      sw.alpha -= dt * 1.8;

      if (sw.alpha <= 0 || sw.r > sw.maxR) {
        state.shockwaves.splice(i, 1);
        continue;
      }

      ctx.beginPath();
      ctx.arc(cx, cy, sw.r, 0, Math.PI * 2);
      ctx.strokeStyle = state.isBoosted 
        ? `rgba(0, 255, 156, ${sw.alpha * 0.85})` 
        : `rgba(0, 229, 255, ${sw.alpha * 0.55})`;
      ctx.lineWidth = 1.8;
      ctx.setLineDash([4, 6]);
      ctx.stroke();
      ctx.setLineDash([]);
    }
    ctx.restore();
  }

  // --- 3. Draw Axial Compressor Multi-Stage Rotor & Aerofoil Blades ---
  function drawCompressorRotor(ctx, cx, cy, radius) {
    ctx.save();
    ctx.translate(cx, cy);

    const rpmFrac = Math.max(0, state.rpm / state.maxRpm);

    // A. Outer Stator Casing Ring (Stationary Housing with Ticks)
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.strokeStyle = isDarkMode ? 'rgba(0, 229, 255, 0.45)' : 'rgba(2, 132, 199, 0.5)';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Secondary concentric guide ring
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.92, 0, Math.PI * 2);
    ctx.strokeStyle = isDarkMode ? 'rgba(0, 255, 156, 0.25)' : 'rgba(16, 185, 129, 0.25)';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 5]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Stator tick marks
    const ticks = 36;
    for (let i = 0; i < ticks; i++) {
      const tickAngle = (i / ticks) * Math.PI * 2;
      const isMajor = i % 9 === 0;
      const len = isMajor ? 8 : 4;
      const r1 = radius;
      const r2 = radius + len;
      ctx.beginPath();
      ctx.moveTo(Math.cos(tickAngle) * r1, Math.sin(tickAngle) * r1);
      ctx.lineTo(Math.cos(tickAngle) * r2, Math.sin(tickAngle) * r2);
      ctx.strokeStyle = isMajor 
        ? (isDarkMode ? '#00e5ff' : '#0284c7') 
        : (isDarkMode ? 'rgba(0, 229, 255, 0.35)' : 'rgba(2, 132, 199, 0.35)');
      ctx.lineWidth = isMajor ? 1.5 : 1;
      ctx.stroke();
    }

    // B. High-Speed Rotational Motion Blur Ring
    if (state.rpm > 1500) {
      const blurGrad = ctx.createRadialGradient(0, 0, radius * 0.35, 0, 0, radius * 0.95);
      if (state.isBoosted) {
        blurGrad.addColorStop(0, 'rgba(0, 255, 156, 0.04)');
        blurGrad.addColorStop(0.7, `rgba(0, 255, 156, ${0.12 * rpmFrac})`);
        blurGrad.addColorStop(1, 'rgba(0, 255, 156, 0)');
      } else {
        blurGrad.addColorStop(0, 'rgba(0, 229, 255, 0.04)');
        blurGrad.addColorStop(0.7, `rgba(0, 229, 255, ${0.10 * rpmFrac})`);
        blurGrad.addColorStop(1, 'rgba(0, 229, 255, 0)');
      }
      ctx.fillStyle = blurGrad;
      ctx.beginPath();
      ctx.arc(0, 0, radius * 0.95, 0, Math.PI * 2);
      ctx.fill();
    }

    // C. 20 Rotating Aerofoil Compressor Blades
    const bladeCount = 20;
    const hubRadius = radius * 0.32;
    const tipRadius = radius * 0.88;

    for (let i = 0; i < bladeCount; i++) {
      const bladeAngle = state.angle + (i / bladeCount) * Math.PI * 2;
      const cosA = Math.cos(bladeAngle);
      const sinA = Math.sin(bladeAngle);

      // Curved aerofoil coordinates
      const rootX = cosA * hubRadius;
      const rootY = sinA * hubRadius;
      const tipX = cosA * tipRadius;
      const tipY = sinA * tipRadius;

      // Aerodynamic camber angle (blade twist)
      const twistFactor = 0.28;
      const perpX = -sinA;
      const perpY = cosA;
      const midR = (hubRadius + tipRadius) * 0.52;
      const midX = Math.cos(bladeAngle + twistFactor) * midR;
      const midY = Math.sin(bladeAngle + twistFactor) * midR;

      // Specular highlight: Glints when passing the ~45° top-right lighting angle
      const lightDiff = Math.abs(Math.sin((bladeAngle - Math.PI * 0.25)));
      const specular = Math.pow(Math.max(0, 1 - lightDiff), 4);

      ctx.beginPath();
      ctx.moveTo(rootX, rootY);
      ctx.quadraticCurveTo(midX + perpX * 3, midY + perpY * 3, tipX, tipY);
      ctx.lineTo(tipX + perpX * 2.5, tipY + perpY * 2.5);
      ctx.quadraticCurveTo(midX - perpX * 2, midY - perpY * 2, rootX + perpX * 1.5, rootY + perpY * 1.5);
      ctx.closePath();

      // Blade Color Styling based on Active View Mode
      if (state.viewMode === 'mechanical') {
        // von Mises Stress Field (Blue root -> Cyan span -> Emerald high-stress tip)
        const bladeGrad = ctx.createLinearGradient(rootX, rootY, tipX, tipY);
        bladeGrad.addColorStop(0, '#0284c7');
        bladeGrad.addColorStop(0.5, '#00e5ff');
        bladeGrad.addColorStop(1, '#00ff9c');
        ctx.fillStyle = bladeGrad;
      } else if (state.viewMode === 'thermal') {
        // Thermal map (cool inlet to hot aerodynamic friction)
        const bladeGrad = ctx.createLinearGradient(rootX, rootY, tipX, tipY);
        bladeGrad.addColorStop(0, '#38bdf8');
        bladeGrad.addColorStop(0.6, '#fbbf24');
        bladeGrad.addColorStop(1, '#f97316');
        ctx.fillStyle = bladeGrad;
      } else if (state.viewMode === 'cad') {
        // CAD Blueprint wireframe
        ctx.fillStyle = 'rgba(0, 229, 255, 0.15)';
        ctx.strokeStyle = '#00e5ff';
        ctx.lineWidth = 1;
        ctx.stroke();
      } else {
        // Standard Titanium Metallic with Dynamic Lighting Glint
        const baseShade = isDarkMode ? 170 : 80;
        const glint = Math.round(specular * 85);
        ctx.fillStyle = `rgb(${baseShade + glint}, ${baseShade + 25 + glint}, ${baseShade + 50 + glint})`;
      }

      ctx.fill();

      // Leading edge luminous highlight
      ctx.beginPath();
      ctx.moveTo(rootX, rootY);
      ctx.quadraticCurveTo(midX + perpX * 3, midY + perpY * 3, tipX, tipY);
      ctx.strokeStyle = state.isBoosted 
        ? `rgba(0, 255, 156, ${0.4 + specular * 0.6})` 
        : `rgba(0, 229, 255, ${0.35 + specular * 0.65})`;
      ctx.lineWidth = 1.2;
      ctx.stroke();
    }

    // D. Central Rotor Hub & Spinner Nose Cone
    // Outer Hub Disc
    ctx.beginPath();
    ctx.arc(0, 0, hubRadius, 0, Math.PI * 2);
    const hubGrad = ctx.createRadialGradient(0, 0, 2, 0, 0, hubRadius);
    if (isDarkMode) {
      hubGrad.addColorStop(0, '#0e2b3d');
      hubGrad.addColorStop(0.8, '#06131d');
      hubGrad.addColorStop(1, '#00e5ff');
    } else {
      hubGrad.addColorStop(0, '#e2e8f0');
      hubGrad.addColorStop(0.8, '#cbd5e1');
      hubGrad.addColorStop(1, '#0284c7');
    }
    ctx.fillStyle = hubGrad;
    ctx.fill();
    ctx.strokeStyle = state.isBoosted ? '#00ff9c' : '#00e5ff';
    ctx.lineWidth = 1.8;
    ctx.stroke();

    // Center Nose Cone Spinner
    const coneRadius = hubRadius * 0.58;
    ctx.beginPath();
    ctx.arc(0, 0, coneRadius, 0, Math.PI * 2);
    ctx.fillStyle = isDarkMode ? '#081722' : '#f1f5f9';
    ctx.fill();
    ctx.strokeStyle = state.isBoosted ? '#00ff9c' : '#00e5ff';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // E. Iconic Aviation Swirl Spiral (Rolls-Royce / GE Style Cone Swirl)
    // Swirls dynamically with rotor rotation!
    ctx.beginPath();
    const swirlSteps = 30;
    const maxSpiralR = coneRadius * 0.85;
    for (let s = 0; s <= swirlSteps; s++) {
      const t = s / swirlSteps;
      const curR = t * maxSpiralR;
      const curAngle = state.angle * 1.5 + t * Math.PI * 3.5;
      const sx = Math.cos(curAngle) * curR;
      const sy = Math.sin(curAngle) * curR;
      if (s === 0) ctx.moveTo(sx, sy);
      else ctx.lineTo(sx, sy);
    }
    ctx.strokeStyle = state.isBoosted ? '#00ff9c' : '#ffffff';
    ctx.lineWidth = 2.2;
    ctx.lineCap = 'round';
    ctx.stroke();

    ctx.restore();
  }

  // --- 4. Draw Diagnostic Mode Overlays (CAD Sweep / Stress / Thermal) ---
  function drawDiagnosticOverlay(ctx, w, h, cx, cy, radius, dt) {
    ctx.save();

    // A. CAD Laser Scanner Sweep Line
    state.scannerX += state.scannerDir * (w * 0.35) * dt;
    if (state.scannerX > w) {
      state.scannerX = w;
      state.scannerDir = -1;
    } else if (state.scannerX < 0) {
      state.scannerX = 0;
      state.scannerDir = 1;
    }

    if (state.viewMode === 'cad' || state.isBoosted) {
      const scanGrad = ctx.createLinearGradient(state.scannerX - 30, 0, state.scannerX + 30, 0);
      scanGrad.addColorStop(0, 'rgba(0, 229, 255, 0)');
      scanGrad.addColorStop(0.5, state.isBoosted ? 'rgba(0, 255, 156, 0.45)' : 'rgba(0, 229, 255, 0.45)');
      scanGrad.addColorStop(1, 'rgba(0, 229, 255, 0)');

      ctx.fillStyle = scanGrad;
      ctx.fillRect(state.scannerX - 30, 0, 60, h);

      ctx.beginPath();
      ctx.moveTo(state.scannerX, 0);
      ctx.lineTo(state.scannerX, h);
      ctx.strokeStyle = state.isBoosted ? '#00ff9c' : '#00e5ff';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    // B. CAD View Blueprint Crosshair & Dimension Indicators
    if (state.viewMode === 'cad') {
      ctx.strokeStyle = 'rgba(0, 229, 255, 0.3)';
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 4]);

      // Crosshairs
      ctx.beginPath();
      ctx.moveTo(cx - radius * 1.2, cy);
      ctx.lineTo(cx + radius * 1.2, cy);
      ctx.moveTo(cx, cy - radius * 1.2);
      ctx.lineTo(cx, cy + radius * 1.2);
      ctx.stroke();

      ctx.setLineDash([]);

      // Dimension Callouts
      ctx.font = '9px "Fira Code", monospace';
      ctx.fillStyle = '#00e5ff';
      ctx.fillText(`Ø ${Math.round(radius * 2)} mm`, cx + radius * 0.7, cy - radius * 0.7);
      ctx.fillText(`β₁ = 42.5°`, cx - radius * 0.9, cy + radius * 0.8);
      ctx.fillText(`Z = 20 BLADES`, cx + radius * 0.3, cy + radius * 0.9);
    }

    ctx.restore();
  }

  // --- Public Interactive Controls ---
  window.toggleCompressorEngine = function (e) {
    if (e) e.stopPropagation();
    state.isRunning = !state.isRunning;
    if (state.isRunning) {
      if (powerBtn) powerBtn.classList.add('active');
      if (powerText) powerText.textContent = 'روشن';
    } else {
      state.isBoosted = false;
      if (powerBtn) powerBtn.classList.remove('active');
      if (powerText) powerText.textContent = 'خاموش';
      if (boostBtn) boostBtn.classList.remove('active');
    }
    updateTelemetry(0);
  };

  window.boostCompressorEngine = function (e) {
    if (e) e.stopPropagation();
    if (!state.isRunning) state.isRunning = true;
    state.isBoosted = !state.isBoosted;

    if (boostBtn) {
      if (state.isBoosted) {
        boostBtn.classList.add('active');
      } else {
        boostBtn.classList.remove('active');
      }
    }
    if (powerBtn) powerBtn.classList.add('active');
    if (powerText) powerText.textContent = 'روشن';
    updateTelemetry(0);
  };

  window.setCompressorThrottle = function (val) {
    state.throttle = Math.max(0, Math.min(100, Number(val)));
    if (!state.isRunning && state.throttle > 5) {
      state.isRunning = true;
      if (powerBtn) powerBtn.classList.add('active');
      if (powerText) powerText.textContent = 'روشن';
    }
    if (throttlePercentEl) throttlePercentEl.textContent = state.throttle + '%';
    state.isBoosted = false;
    if (boostBtn) boostBtn.classList.remove('active');
    updateTelemetry(0);
  };

  window.cycleCompressorMode = function (e) {
    if (e) e.stopPropagation();
    state.modeIndex = (state.modeIndex + 1) % state.modes.length;
    state.viewMode = state.modes[state.modeIndex];
    if (modeText) {
      modeText.textContent = state.modeLabels[state.viewMode];
    }
  };

  window.toggleCompressorAudio = function (e) {
    if (e) e.stopPropagation();
    if (!state.audioCtx) {
      initAudio();
    }
    if (state.audioCtx && state.audioCtx.state === 'suspended') {
      state.audioCtx.resume();
    }

    state.isAudioActive = !state.isAudioActive;

    if (soundBtn) {
      if (state.isAudioActive) {
        soundBtn.classList.add('active');
        if (soundText) soundText.textContent = 'صدا فعال';
        if (soundIcon) soundIcon.setAttribute('data-lucide', 'volume-2');
      } else {
        soundBtn.classList.remove('active');
        if (soundText) soundText.textContent = 'صدا';
        if (soundIcon) soundIcon.setAttribute('data-lucide', 'volume-x');
        if (state.audioGain && state.audioCtx) {
          state.audioGain.gain.setTargetAtTime(0.0001, state.audioCtx.currentTime, 0.1);
        }
      }
      if (window.lucide) lucide.createIcons();
    }
  };

  // --- Canvas Resizing ---
  function resizeCanvas() {
    if (!canvas || !stageEl) return;
    const rect = stageEl.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const w = Math.floor(rect.width);
    const h = Math.floor(rect.height);

    if (w > 0 && h > 0) {
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
      canvas.width = w;
      canvas.height = h;

      initParticles(w, h);
    }
  }

  // --- Initialization ---
  function init() {
    stageEl = document.getElementById('heroCompressorStage');
    canvas = document.getElementById('heroCompressorCanvas');
    if (!canvas || !stageEl) return;

    ctx = canvas.getContext('2d');
    imgEl = document.getElementById('heroCompressorImg');

    // Telemetry DOM
    statusLabelEl = document.getElementById('compressorStatusLabel');
    rpmDisplayEl = document.getElementById('compressorRpmDisplay');
    prDisplayEl = document.getElementById('compressorPrDisplay');
    flowDisplayEl = document.getElementById('compressorFlowDisplay');
    tempDisplayEl = document.getElementById('compressorTempDisplay');

    // Control Buttons
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

    updateThemeState();

    // Theme Mutation Observer
    const themeObs = new MutationObserver(updateThemeState);
    themeObs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    themeObs.observe(document.body, { attributes: true, attributeFilter: ['class'] });

    // Viewport Intersection Observer (pause canvas render when scrolled out to save CPU)
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        state.inViewport = entries[0].isIntersecting;
      }, { threshold: 0.1 });
      io.observe(stageEl);
    }

    // Size listener
    window.addEventListener('resize', resizeCanvas, { passive: true });
    resizeCanvas();

    // Initialize Telemetry
    updateTelemetry(0);

    if (window.lucide) {
      lucide.createIcons();
    }

    // Start loop
    requestAnimationFrame(render);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
