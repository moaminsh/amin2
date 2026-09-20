/**
 * Mechanical Engineering Background Blueprint & Schematic Engine
 * Mohammadamin Sharif - Fluid Mechanics, CFD & Turbomachinery Portfolio
 * Rich blueprint schematic: Rankine Cycle, Planetary Gear Train, Turbomachine Impellers,
 * CFD Karman Vortex Street, Venturi Tube & Bernoulli Differential, Four-Bar Linkage,
 * P&ID Instrumentation, Navier-Stokes & Euler Formulas, Technical Compass Grids.
 */
(function() {
  const canvas = document.getElementById('engineeringBgCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  let width = 0;
  let height = 0;
  let dpr = 1;
  let animTime = 0;
  let mouseX = -1000;
  let mouseY = -1000;
  let targetMouseX = -1000;
  let targetMouseY = -1000;

  // Track theme changes dynamically
  let isDarkMode = document.documentElement.classList.contains('dark-mode') ||
                   document.body.classList.contains('dark-mode') ||
                   !document.body.classList.contains('light-mode');

  const themeObserver = new MutationObserver(() => {
    isDarkMode = document.documentElement.classList.contains('dark-mode') ||
                 document.body.classList.contains('dark-mode') ||
                 !document.body.classList.contains('light-mode');
  });
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  themeObserver.observe(document.body, { attributes: true, attributeFilter: ['class'] });

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  window.addEventListener('mousemove', (e) => {
    targetMouseX = e.clientX;
    targetMouseY = e.clientY;
  }, { passive: true });

  window.addEventListener('mouseleave', () => {
    targetMouseX = -1000;
    targetMouseY = -1000;
  }, { passive: true });

  // Tracer particles traveling inside Rankine cycle conduit loops
  const cycleFlowParticles = Array.from({ length: 48 }, (_, i) => ({
    progress: (i / 48),
    speed: 0.0018 + (i % 3) * 0.0004
  }));

  // Floating micro CFD particles across viewport
  const ambientFlowStream = Array.from({ length: 36 }, () => ({
    x: Math.random() * 2000,
    y: Math.random() * 1200,
    vx: 0.4 + Math.random() * 0.8,
    vy: (Math.random() - 0.5) * 0.3,
    size: 1 + Math.random() * 1.5,
    alpha: 0.15 + Math.random() * 0.35
  }));

  // Gear generation helper
  function drawInvoluteGear(ctx, cx, cy, radius, teeth, toothDepth, rotation, strokeCol, fillCol, showShaft = true) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rotation);

    ctx.strokeStyle = strokeCol;
    ctx.fillStyle = fillCol || 'transparent';
    ctx.lineWidth = 1;

    const angleStep = (Math.PI * 2) / teeth;
    ctx.beginPath();
    for (let i = 0; i < teeth; i++) {
      const a0 = i * angleStep;
      const a1 = a0 + angleStep * 0.22;
      const a2 = a0 + angleStep * 0.50;
      const a3 = a0 + angleStep * 0.72;
      const a4 = (i + 1) * angleStep;

      const rInner = radius - toothDepth;
      const rPitch = radius;
      const rOuter = radius + toothDepth;

      const p0x = Math.cos(a0) * rInner;
      const p0y = Math.sin(a0) * rInner;
      const p1x = Math.cos(a1) * rOuter;
      const p1y = Math.sin(a1) * rOuter;
      const p2x = Math.cos(a2) * rOuter;
      const p2y = Math.sin(a2) * rOuter;
      const p3x = Math.cos(a3) * rInner;
      const p3y = Math.sin(a3) * rInner;

      if (i === 0) ctx.moveTo(p0x, p0y);
      else ctx.lineTo(p0x, p0y);
      ctx.lineTo(p1x, p1y);
      ctx.lineTo(p2x, p2y);
      ctx.lineTo(p3x, p3y);
    }
    ctx.closePath();
    if (fillCol) ctx.fill();
    ctx.stroke();

    // Pitch circle (dashed)
    ctx.beginPath();
    ctx.setLineDash([3, 3]);
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Base hub & keyway
    if (showShaft) {
      const hubR = radius * 0.35;
      ctx.beginPath();
      ctx.arc(0, 0, hubR, 0, Math.PI * 2);
      ctx.stroke();

      // Shaft bore with rectangular keyway
      const boreR = hubR * 0.55;
      ctx.beginPath();
      ctx.arc(0, 0, boreR, 0, Math.PI * 2);
      ctx.rect(-boreR * 0.25, -boreR * 1.25, boreR * 0.5, boreR * 0.5);
      ctx.stroke();

      // 4 Weight-reduction radial holes
      if (radius > 35) {
        const holeR = hubR * 0.45;
        const holeDist = (radius + hubR) * 0.52;
        for (let h = 0; h < 4; h++) {
          const ha = (h * Math.PI) / 2 + Math.PI / 4;
          ctx.beginPath();
          ctx.arc(Math.cos(ha) * holeDist, Math.sin(ha) * holeDist, holeR, 0, Math.PI * 2);
          ctx.stroke();
        }
      }
    }

    ctx.restore();
  }

  // Draw Technical Blueprint Coordinate Grid & Crosshairs
  function drawBlueprintGrid(ctx, w, h, primaryAlpha, accentCol) {
    const gridSize = 48;
    const majorEvery = 4;

    ctx.save();
    ctx.lineWidth = 0.5;

    // Minor lines
    ctx.strokeStyle = isDarkMode ? `rgba(56, 189, 248, ${0.035 * primaryAlpha})` : `rgba(2, 132, 199, ${0.035 * primaryAlpha})`;
    ctx.beginPath();
    for (let x = 0; x < w; x += gridSize) {
      ctx.moveTo(x, 0); ctx.lineTo(x, h);
    }
    for (let y = 0; y < h; y += gridSize) {
      ctx.moveTo(0, y); ctx.lineTo(w, y);
    }
    ctx.stroke();

    // Major lines & millimeter scale markers
    ctx.strokeStyle = isDarkMode ? `rgba(0, 242, 254, ${0.08 * primaryAlpha})` : `rgba(2, 132, 199, ${0.08 * primaryAlpha})`;
    ctx.beginPath();
    for (let x = 0; x < w; x += gridSize * majorEvery) {
      ctx.moveTo(x, 0); ctx.lineTo(x, h);
    }
    for (let y = 0; y < h; y += gridSize * majorEvery) {
      ctx.moveTo(0, y); ctx.lineTo(w, y);
    }
    ctx.stroke();

    // Micro crosshairs at intersections
    ctx.strokeStyle = isDarkMode ? `rgba(0, 242, 254, ${0.2 * primaryAlpha})` : `rgba(2, 132, 199, ${0.22 * primaryAlpha})`;
    ctx.lineWidth = 0.8;
    const crossStep = gridSize * 2;
    for (let x = crossStep; x < w; x += crossStep) {
      for (let y = crossStep; y < h; y += crossStep) {
        ctx.beginPath();
        ctx.moveTo(x - 3.5, y); ctx.lineTo(x + 3.5, y);
        ctx.moveTo(x, y - 3.5); ctx.lineTo(x, y + 3.5);
        ctx.stroke();
      }
    }

    // Top-left engineering title block watermark
    ctx.fillStyle = isDarkMode ? `rgba(148, 163, 184, ${0.3 * primaryAlpha})` : `rgba(71, 85, 105, ${0.35 * primaryAlpha})`;
    ctx.font = '9px "Fira Code", monospace';
    ctx.fillText('SYSTEM: IUST-MECH-ENG-SYS // DWG NO: 2026-ME-04 // SCALE: 1:1', 28, 42);
    ctx.fillText('DESIGNATION: THERMO-FLUID & TURBOMACHINERY INTEGRATED SCHEMATIC', 28, 54);

    // Bottom-right engineering coordinates watermark
    const coordStr = `DATUM X: ${Math.round(w)} mm | Y: ${Math.round(h)} mm | UNITS: SI (m, s, kg, Pa, K)`;
    ctx.fillText(coordStr, Math.max(28, w - 420), h - 30);

    ctx.restore();
  }

  // 1. PLANETARY EPICYCLIC GEAR TRAIN (Sun, 3 Planets, Ring Gear, Carrier Arm)
  function drawPlanetaryGearset(ctx, cx, cy, t, alpha, strokeCol, accentCol) {
    ctx.save();
    ctx.translate(cx, cy);

    const sunR = 26;
    const planetR = 20;
    const carrierR = sunR + planetR; // 46
    const ringR = sunR + 2 * planetR; // 66

    // Outer Ring Gear (Internal teeth schematic)
    ctx.strokeStyle = strokeCol;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(0, 0, ringR + 8, 0, Math.PI * 2);
    ctx.arc(0, 0, ringR, 0, Math.PI * 2);
    ctx.stroke();

    // Stamped bolt holes on ring flange
    for (let b = 0; b < 8; b++) {
      const ba = (b * Math.PI * 2) / 8;
      ctx.beginPath();
      ctx.arc(Math.cos(ba) * (ringR + 4.5), Math.sin(ba) * (ringR + 4.5), 1.2, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Triangular Carrier Spider Arm
    const carrierRot = t * 0.35;
    ctx.save();
    ctx.rotate(carrierRot);
    ctx.strokeStyle = isDarkMode ? 'rgba(56, 189, 248, 0.45)' : 'rgba(2, 132, 199, 0.5)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let p = 0; p < 3; p++) {
      const pa = (p * Math.PI * 2) / 3;
      const px = Math.cos(pa) * carrierR;
      const py = Math.sin(pa) * carrierR;
      if (p === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.stroke();
    ctx.restore();

    // Central Sun Gear
    const sunRot = -t * 1.4;
    drawInvoluteGear(ctx, 0, 0, sunR, 14, 3.5, sunRot, strokeCol, null, true);

    // 3 Planet Gears orbiting carrier
    for (let p = 0; p < 3; p++) {
      const planetAngle = carrierRot + (p * Math.PI * 2) / 3;
      const px = Math.cos(planetAngle) * carrierR;
      const py = Math.sin(planetAngle) * carrierR;
      const planetRot = carrierRot + (sunRot - carrierRot) * (sunR / planetR);
      drawInvoluteGear(ctx, px, py, planetR, 10, 3, planetRot, strokeCol, null, false);

      // Planet pin
      ctx.beginPath();
      ctx.fillStyle = accentCol;
      ctx.arc(px, py, 2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Annotation
    ctx.fillStyle = strokeCol;
    ctx.font = '8px "Fira Code", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('EPICYCLIC PLANETARY STAGE', 0, ringR + 22);
    ctx.fillText(`i = 1 + (Z_ring / Z_sun) = 3.55`, 0, ringR + 32);

    ctx.restore();
  }

  // 2. CENTRIFUGAL PUMP & VOLUTE CASING (Radial Impeller, Backward-Curved Blades, Diffuser)
  function drawTurbomachinePump(ctx, cx, cy, t, alpha, strokeCol, accentCol) {
    ctx.save();
    ctx.translate(cx, cy);

    // Logarithmic spiral volute casing contour
    ctx.strokeStyle = strokeCol;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    const rBase = 26;
    for (let a = 0; a <= Math.PI * 2; a += 0.08) {
      const r = rBase + a * 6.5;
      const vx = Math.cos(a) * r;
      const vy = Math.sin(a) * r;
      if (a === 0) ctx.moveTo(vx, vy);
      else ctx.lineTo(vx, vy);
    }
    // Volute discharge nozzle tangentially
    const rEnd = rBase + Math.PI * 2 * 6.5;
    ctx.lineTo(rEnd + 40, -18);
    ctx.lineTo(rEnd + 40, -4);
    ctx.stroke();

    // Tangential discharge nozzle flange & bolts
    ctx.strokeRect(rEnd + 40, -22, 5, 22);
    ctx.strokeRect(rEnd + 38, -20, 2, 18);

    // Suction eye outer circle
    ctx.beginPath();
    ctx.setLineDash([2, 2]);
    ctx.arc(0, 0, 16, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Rotating Impeller with 6 backward-curved hydrodynamic blades
    ctx.save();
    ctx.rotate(t * 1.8);
    ctx.strokeStyle = accentCol;
    ctx.lineWidth = 1.3;
    const numBlades = 6;
    for (let b = 0; b < numBlades; b++) {
      const ba = (b * Math.PI * 2) / numBlades;
      ctx.beginPath();
      // Log-spiral blade curve from hub r=6 to outer tip r=24
      ctx.moveTo(Math.cos(ba) * 6, Math.sin(ba) * 6);
      ctx.quadraticCurveTo(
        Math.cos(ba + 0.4) * 16,
        Math.sin(ba + 0.4) * 16,
        Math.cos(ba - 0.35) * 24,
        Math.sin(ba - 0.35) * 24
      );
      ctx.stroke();
    }

    // Impeller hub & central nut
    ctx.beginPath();
    ctx.fillStyle = strokeCol;
    ctx.arc(0, 0, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(0, 0, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Dynamic Pressure Manometer gauge attached to discharge
    ctx.save();
    ctx.translate(rEnd + 26, -34);
    ctx.strokeStyle = strokeCol;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(0, 0, 12, 0, Math.PI * 2);
    ctx.stroke();
    // Dial ticks
    for (let tk = -120; tk <= 120; tk += 30) {
      const tra = (tk * Math.PI) / 180;
      ctx.beginPath();
      ctx.moveTo(Math.cos(tra) * 10, Math.sin(tra) * 10);
      ctx.lineTo(Math.cos(tra) * 12, Math.sin(tra) * 12);
      ctx.stroke();
    }
    // Oscillating needle
    const needleAng = Math.sin(t * 2.2) * 0.45 - 0.3;
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.cos(needleAng) * 9, Math.sin(needleAng) * 9);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, 1.8, 0, Math.PI * 2);
    ctx.fillStyle = '#ef4444';
    ctx.fill();
    ctx.restore();

    // Flow velocity vector triangle watermark
    ctx.save();
    ctx.translate(-40, -42);
    ctx.strokeStyle = strokeCol;
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(0, 0); ctx.lineTo(32, 0); // Blade speed U
    ctx.lineTo(24, -18); // Absolute flow V
    ctx.closePath();
    ctx.stroke();
    ctx.fillStyle = strokeCol;
    ctx.font = '7.5px "Fira Code", monospace';
    ctx.fillText('U_2 (Blade)', 8, 8);
    ctx.fillText('V_2 (Abs)', 26, -10);
    ctx.fillText('W_2 (Rel)', 4, -10);
    ctx.restore();

    // Pump labels
    ctx.fillStyle = strokeCol;
    ctx.font = '8px "Fira Code", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('CENTRIFUGAL VOLUTE PUMP (BFP)', 0, rEnd + 14);
    ctx.fillText('H = (U_2·V_u2 - U_1·V_u1)/g', 0, rEnd + 24);

    ctx.restore();
  }

  // 3. MULTI-STAGE AXIAL STEAM TURBINE & ROTOR BLADE EXPANSION
  function drawSteamTurbine(ctx, cx, cy, t, alpha, strokeCol, accentCol) {
    ctx.save();
    ctx.translate(cx, cy);

    // Expanding conical trapezoid casing (High Pressure HP to Low Pressure LP)
    ctx.strokeStyle = strokeCol;
    ctx.lineWidth = 1.2;

    const wHp = 22;
    const wLp = 54;
    const length = 90;

    ctx.beginPath();
    // Top casing
    ctx.moveTo(-length / 2, -wHp);
    ctx.lineTo(length / 2, -wLp);
    // LP exhaust flange
    ctx.lineTo(length / 2, wLp);
    // Bottom casing
    ctx.lineTo(-length / 2, wHp);
    // HP inlet flange
    ctx.closePath();
    ctx.stroke();

    // Stator Diaphragm Guide Vanes & Rotor Stages (4 expansion stages)
    const stages = 5;
    ctx.lineWidth = 0.9;
    for (let s = 0; s < stages; s++) {
      const frac = s / (stages - 1);
      const sx = -length / 2 + frac * length;
      const sh = wHp + frac * (wLp - wHp);

      // Stator blade row (stationary dashed)
      ctx.strokeStyle = strokeCol;
      ctx.setLineDash([2, 2]);
      ctx.beginPath();
      ctx.moveTo(sx - 4, -sh + 4);
      ctx.lineTo(sx - 4, sh - 4);
      ctx.stroke();
      ctx.setLineDash([]);

      // Rotor blade row (spinning motion indicated)
      ctx.strokeStyle = accentCol;
      const bladeH = sh - 6;
      const numBladesShown = Math.round(5 + frac * 4);
      for (let b = 0; b < numBladesShown; b++) {
        const by = -bladeH + (b / (numBladesShown - 1)) * (2 * bladeH);
        const bladeTilt = Math.sin(t * 3 + s + b) * 2;
        ctx.beginPath();
        ctx.moveTo(sx + 3, by - 2);
        ctx.lineTo(sx + 5 + bladeTilt, by + 2);
        ctx.stroke();
      }
    }

    // Heavy Rotor Drive Shaft extending to synchronous alternator
    ctx.strokeStyle = strokeCol;
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(-length / 2 - 18, 0);
    ctx.lineTo(length / 2 + 35, 0);
    ctx.stroke();

    // Synchronous Generator Stator schematic (Right side)
    const genX = length / 2 + 45;
    ctx.lineWidth = 1;
    ctx.strokeRect(genX - 10, -26, 20, 52);
    // Stator field coils
    for (let c = -20; c <= 20; c += 10) {
      ctx.beginPath();
      ctx.arc(genX, c, 3.5, 0, Math.PI * 2);
      ctx.stroke();
    }

    // HP Governor Throttle Control Valve (Top left inlet)
    ctx.strokeRect(-length / 2 - 12, -wHp - 22, 16, 18);
    // Two valve opposing triangles
    ctx.beginPath();
    ctx.moveTo(-length / 2 - 10, -wHp - 18);
    ctx.lineTo(-length / 2 + 2, -wHp - 6);
    ctx.lineTo(-length / 2 - 10, -wHp - 6);
    ctx.lineTo(-length / 2 + 2, -wHp - 18);
    ctx.closePath();
    ctx.stroke();

    // Labels
    ctx.fillStyle = strokeCol;
    ctx.font = '8px "Fira Code", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('MULTI-STAGE REACTION STEAM TURBINE', 0, wLp + 18);
    ctx.fillText('W_turb = ṁ · (h_inlet - h_exhaust) · η_isen', 0, wLp + 28);

    ctx.restore();
  }

  // 4. STEAM BOILER & SUPERHEATER P&ID SCHEMATIC (Steam drum, downcomer, mud drum, furnace)
  function drawBoilerFurnace(ctx, cx, cy, t, alpha, strokeCol, accentCol) {
    ctx.save();
    ctx.translate(cx, cy);

    // Steam Drum (Top)
    ctx.strokeStyle = strokeCol;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.ellipse(0, -50, 36, 14, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Liquid/Vapor Waterline inside steam drum
    ctx.beginPath();
    ctx.setLineDash([3, 2]);
    ctx.moveTo(-30, -50);
    ctx.lineTo(30, -50);
    ctx.stroke();
    ctx.setLineDash([]);

    // Mud Drum (Bottom)
    ctx.beginPath();
    ctx.ellipse(0, 50, 28, 12, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Downcomers (Large unheated cold downcomer pipes on outer sides)
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-32, -48);
    ctx.bezierCurveTo(-52, -20, -52, 20, -25, 48);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(32, -48);
    ctx.bezierCurveTo(52, -20, 52, 20, 25, 48);
    ctx.stroke();

    // Heated Riser Tubes & Superheater Serpentine Coil in center
    ctx.lineWidth = 0.9;
    ctx.strokeStyle = accentCol;
    const numTubes = 5;
    for (let i = 0; i < numTubes; i++) {
      const tx = -18 + i * 9;
      ctx.beginPath();
      ctx.moveTo(tx, -37);
      // Serpentine bends
      const wave = Math.sin(t * 1.5 + i) * 1.5;
      ctx.bezierCurveTo(tx + 4 + wave, -15, tx - 4 - wave, 15, tx, 39);
      ctx.stroke();
    }

    // Burner Nozzle / Combustion flame schematic at bottom
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    for (let fl = -14; fl <= 14; fl += 7) {
      ctx.moveTo(fl, 28);
      const fh = 12 + Math.sin(t * 4 + fl) * 4;
      ctx.lineTo(fl - 2, 28 - fh * 0.6);
      ctx.lineTo(fl, 28 - fh);
      ctx.lineTo(fl + 2, 28 - fh * 0.6);
      ctx.closePath();
    }
    ctx.stroke();

    // Safety Relief Valve (Top of steam drum)
    ctx.strokeStyle = strokeCol;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, -64);
    ctx.lineTo(0, -78);
    // Spring valve bonnet
    ctx.strokeRect(-4, -78, 8, 8);
    ctx.stroke();

    // Annotation
    ctx.fillStyle = strokeCol;
    ctx.font = '8px "Fira Code", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('UTILITY WATER-TUBE BOILER', 0, 72);
    ctx.fillText('Q_in = ṁ · (h_superheat - h_feedwater)', 0, 82);

    ctx.restore();
  }

  // 5. SHELL-AND-TUBE SURFACE CONDENSER & COOLING TOWER LOOP
  function drawSurfaceCondenser(ctx, cx, cy, t, alpha, strokeCol, accentCol) {
    ctx.save();
    ctx.translate(cx, cy);

    // Cylindrical horizontal shell
    ctx.strokeStyle = strokeCol;
    ctx.lineWidth = 1.2;
    const shellW = 86;
    const shellH = 46;

    ctx.strokeRect(-shellW / 2, -shellH / 2, shellW, shellH);

    // Left and right dished head water boxes
    ctx.beginPath();
    ctx.arc(-shellW / 2, 0, shellH / 2, Math.PI * 0.5, Math.PI * 1.5);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(shellW / 2, 0, shellH / 2, -Math.PI * 0.5, Math.PI * 0.5);
    ctx.stroke();

    // Internal 2-pass cooling water tubes
    ctx.lineWidth = 0.8;
    ctx.strokeStyle = isDarkMode ? 'rgba(56, 189, 248, 0.5)' : 'rgba(2, 132, 199, 0.5)';
    for (let row = -16; row <= 16; row += 8) {
      ctx.beginPath();
      ctx.moveTo(-shellW / 2 + 4, row);
      ctx.lineTo(shellW / 2 - 4, row);
      ctx.stroke();

      // Tube sheet rolled joints
      ctx.beginPath();
      ctx.arc(-shellW / 2 + 4, row, 1.2, 0, Math.PI * 2);
      ctx.arc(shellW / 2 - 4, row, 1.2, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Top steam exhaust dome nozzle (receiving vapor from turbine)
    ctx.strokeRect(-18, -shellH / 2 - 14, 36, 14);

    // Bottom condensate Hotwell sump (collecting liquid water)
    ctx.strokeRect(-14, shellH / 2, 28, 12);
    // Liquid level line
    ctx.beginPath();
    ctx.setLineDash([2, 2]);
    ctx.moveTo(-12, shellH / 2 + 6);
    ctx.lineTo(12, shellH / 2 + 6);
    ctx.stroke();
    ctx.setLineDash([]);

    // Vacuum Manometer (-0.95 bar vacuum gauge)
    ctx.save();
    ctx.translate(shellW / 2 + 18, -16);
    ctx.beginPath();
    ctx.arc(0, 0, 9, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.cos(t * 0.6) * 6, Math.sin(t * 0.6) * 6);
    ctx.strokeStyle = '#ef4444';
    ctx.stroke();
    ctx.restore();

    // Annotation
    ctx.fillStyle = strokeCol;
    ctx.font = '8px "Fira Code", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('SURFACE STEAM CONDENSER', 0, shellH / 2 + 22);
    ctx.fillText('P_sat = 0.08 bar | Q_out = ṁ · (h_in - h_out)', 0, shellH / 2 + 32);

    ctx.restore();
  }

  // 6. FOUR-BAR LINKAGE CRANK-ROCKER KINEMATICS
  function drawFourBarLinkage(ctx, cx, cy, t, alpha, strokeCol, accentCol) {
    ctx.save();
    ctx.translate(cx, cy);

    // Fixed ground pivots O2 and O4
    const O2 = { x: -35, y: 15 };
    const O4 = { x: 35, y: 15 };

    // Crank length r2, Coupler r3, Rocker r4
    const r2 = 22; // Crank (revolves 360°)
    const r3 = 54; // Coupler
    const r4 = 38; // Rocker

    const crankTheta = t * 1.5;
    const A = {
      x: O2.x + Math.cos(crankTheta) * r2,
      y: O2.y + Math.sin(crankTheta) * r2
    };

    // Calculate position of joint B via circle intersection
    const dx = O4.x - A.x;
    const dy = O4.y - A.y;
    const d = Math.hypot(dx, dy);

    let B = { x: O4.x, y: O4.y - r4 };
    if (d > 0 && d < r3 + r4) {
      const a = (r3 * r3 - r4 * r4 + d * d) / (2 * d);
      const h = Math.sqrt(Math.max(0, r3 * r3 - a * a));
      const p2x = A.x + (dx * a) / d;
      const p2y = A.y + (dy * a) / d;
      // choose upper branch
      B = {
        x: p2x - (dy * h) / d,
        y: p2y + (dx * h) / d
      };
    }

    // Ground Frame Hatching
    ctx.strokeStyle = strokeCol;
    ctx.lineWidth = 1;
    [O2, O4].forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
      ctx.stroke();
      // Triangle base
      ctx.beginPath();
      ctx.moveTo(p.x - 6, p.y + 10);
      ctx.lineTo(p.x + 6, p.y + 10);
      ctx.lineTo(p.x, p.y);
      ctx.closePath();
      ctx.stroke();
      // Ground slashes
      for (let s = -8; s <= 8; s += 4) {
        ctx.moveTo(p.x + s, p.y + 10);
        ctx.lineTo(p.x + s - 3, p.y + 14);
      }
      ctx.stroke();
    });

    // Links: Link 2 (Crank), Link 3 (Coupler), Link 4 (Rocker)
    ctx.lineWidth = 1.8;
    ctx.strokeStyle = accentCol;
    // Link 2 (Crank)
    ctx.beginPath();
    ctx.moveTo(O2.x, O2.y);
    ctx.lineTo(A.x, A.y);
    ctx.stroke();

    // Link 3 (Coupler)
    ctx.strokeStyle = isDarkMode ? '#38bdf8' : '#0284c7';
    ctx.beginPath();
    ctx.moveTo(A.x, A.y);
    ctx.lineTo(B.x, B.y);
    ctx.stroke();

    // Link 4 (Rocker)
    ctx.strokeStyle = strokeCol;
    ctx.beginPath();
    ctx.moveTo(O4.x, O4.y);
    ctx.lineTo(B.x, B.y);
    ctx.stroke();

    // Pin Joints (brass bearings)
    [O2, A, B, O4].forEach(pt => {
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = '#f59e0b';
      ctx.fill();
      ctx.stroke();
    });

    // Trace path of coupler midpoint (Coupler curve)
    const midC = { x: (A.x + B.x) / 2, y: (A.y + B.y) / 2 };
    ctx.beginPath();
    ctx.arc(midC.x, midC.y, 1.5, 0, Math.PI * 2);
    ctx.fillStyle = '#ef4444';
    ctx.fill();

    // Labels
    ctx.fillStyle = strokeCol;
    ctx.font = '8px "Fira Code", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('4-BAR PLANAR KINEMATICS', 0, 36);
    ctx.fillText('Grashof: s + l ≤ p + q', 0, 46);

    ctx.restore();
  }

  // 7. VENTURI TUBE & BERNOULLI DIFFERENTIAL PRESSURE COLUMN
  function drawVenturiTube(ctx, cx, cy, t, alpha, strokeCol, accentCol) {
    ctx.save();
    ctx.translate(cx, cy);

    ctx.strokeStyle = strokeCol;
    ctx.lineWidth = 1.2;

    const L = 90;
    const D1 = 34; // Inlet pipe diameter
    const D2 = 14; // Throat diameter

    // Converging-diverging pipe walls
    // Top wall
    ctx.beginPath();
    ctx.moveTo(-L / 2, -D1 / 2);
    ctx.lineTo(-L * 0.22, -D1 / 2);
    ctx.lineTo(-L * 0.06, -D2 / 2); // Converging cone 21°
    ctx.lineTo(L * 0.06, -D2 / 2);  // Throat
    ctx.lineTo(L * 0.32, -D1 / 2);  // Diverging diffuser cone 7°
    ctx.lineTo(L / 2, -D1 / 2);
    ctx.stroke();

    // Bottom wall
    ctx.beginPath();
    ctx.moveTo(-L / 2, D1 / 2);
    ctx.lineTo(-L * 0.22, D1 / 2);
    ctx.lineTo(-L * 0.06, D2 / 2);
    ctx.lineTo(L * 0.06, D2 / 2);
    ctx.lineTo(L * 0.32, D1 / 2);
    ctx.lineTo(L / 2, D1 / 2);
    ctx.stroke();

    // Flanges on inlet and outlet
    ctx.strokeRect(-L / 2 - 4, -D1 / 2 - 4, 4, D1 + 8);
    ctx.strokeRect(L / 2, -D1 / 2 - 4, 4, D1 + 8);

    // Streamlines inside Venturi
    ctx.lineWidth = 0.7;
    ctx.strokeStyle = accentCol;
    [-0.3, 0, 0.3].forEach(off => {
      ctx.beginPath();
      ctx.moveTo(-L / 2, (D1 / 2) * off);
      ctx.lineTo(-L * 0.22, (D1 / 2) * off);
      ctx.lineTo(-L * 0.06, (D2 / 2) * off);
      ctx.lineTo(L * 0.06, (D2 / 2) * off);
      ctx.lineTo(L * 0.32, (D1 / 2) * off);
      ctx.lineTo(L / 2, (D1 / 2) * off);
      ctx.stroke();
    });

    // Piezometer differential manometer columns
    // Column 1 at inlet (higher pressure, higher static head)
    const h1 = 28;
    ctx.strokeStyle = strokeCol;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-L * 0.28, -D1 / 2);
    ctx.lineTo(-L * 0.28, -D1 / 2 - h1);
    ctx.moveTo(-L * 0.28 + 6, -D1 / 2);
    ctx.lineTo(-L * 0.28 + 6, -D1 / 2 - h1);
    ctx.stroke();
    // Fluid meniscus
    ctx.beginPath();
    ctx.fillStyle = isDarkMode ? 'rgba(0, 242, 254, 0.5)' : 'rgba(2, 132, 199, 0.5)';
    ctx.fillRect(-L * 0.28, -D1 / 2 - h1 + 6, 6, h1 - 6);

    // Column 2 at throat (lower static pressure, higher velocity)
    const h2 = 12;
    ctx.beginPath();
    ctx.moveTo(0, -D2 / 2);
    ctx.lineTo(0, -D2 / 2 - h2);
    ctx.moveTo(6, -D2 / 2);
    ctx.lineTo(6, -D2 / 2 - h2);
    ctx.stroke();
    ctx.fillRect(0, -D2 / 2 - h2 + 4, 6, h2 - 4);

    // Differential height dimension indicator Δh
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 0.8;
    ctx.setLineDash([2, 2]);
    ctx.beginPath();
    ctx.moveTo(-L * 0.28 + 6, -D1 / 2 - h1 + 6);
    ctx.lineTo(0, -D1 / 2 - h1 + 6);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#ef4444';
    ctx.font = '7.5px "Fira Code", monospace';
    ctx.fillText('Δh', -12, -D1 / 2 - h1 + 10);

    // Labels
    ctx.fillStyle = strokeCol;
    ctx.font = '8px "Fira Code", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('VENTURIMETER FLOWMETER', 0, D1 / 2 + 18);
    ctx.fillText('P_1 + ½ρV_1² = P_2 + ½ρV_2²', 0, D1 / 2 + 28);

    ctx.restore();
  }

  // 8. CFD KARMAN VORTEX STREET INSTABILITY (Transient cylinder wake shedding)
  function drawKarmanVortexStreet(ctx, cx, cy, t, alpha, strokeCol, accentCol) {
    ctx.save();
    ctx.translate(cx, cy);

    // Cylinder obstacle
    const cylR = 10;
    ctx.strokeStyle = accentCol;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.arc(0, 0, cylR, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = isDarkMode ? 'rgba(15, 23, 42, 0.9)' : 'rgba(241, 245, 249, 0.9)';
    ctx.fill();

    // Upstream stagnation arrow
    ctx.strokeStyle = strokeCol;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-35, 0); ctx.lineTo(-cylR - 3, 0);
    ctx.moveTo(-cylR - 7, -3); ctx.lineTo(-cylR - 3, 0); ctx.lineTo(-cylR - 7, 3);
    ctx.stroke();
    ctx.fillStyle = strokeCol;
    ctx.font = '7px "Fira Code", monospace';
    ctx.fillText('U_∞', -32, -5);

    // Alternating Von Karman vortices downstream (6 pairs)
    const numVortices = 7;
    for (let k = 1; k <= numVortices; k++) {
      const vx = k * 18;
      // Staggered positive / negative sign
      const sign = (k % 2 === 1) ? 1 : -1;
      const vy = sign * (7 + Math.sin(t * 3 - k) * 3);
      const vRad = 3.5 + k * 1.1;

      // Spiral vortex lines
      ctx.strokeStyle = sign > 0 ? '#ef4444' : '#38bdf8';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      for (let th = 0; th <= Math.PI * 3; th += 0.3) {
        const rad = (th / (Math.PI * 3)) * vRad;
        const spin = sign * (th + t * 2);
        const px = vx + Math.cos(spin) * rad;
        const py = vy + Math.sin(spin) * rad;
        if (th === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
    }

    // Annotation
    ctx.fillStyle = strokeCol;
    ctx.font = '8px "Fira Code", monospace';
    ctx.textAlign = 'left';
    ctx.fillText('VON KÁRMÁN VORTEX SHEDDING (Re ≈ 1,850)', -20, 26);
    ctx.fillText('St = (f · D) / U_∞ ≈ 0.20 // Cl(t) Periodic Oscillations', -20, 36);

    ctx.restore();
  }

  // 9. COMPLETE RANKINE POWER CYCLE CONDUIT SYSTEM (Connecting Boiler -> Turbine -> Condenser -> Pump)
  function drawFullRankineCycleCircuit(ctx, w, h, t, alpha, strokeCol, accentCol) {
    // Determine dynamic schematic coordinates responsive to screen size
    const padX = Math.max(60, w * 0.08);
    const padY = Math.max(70, h * 0.12);

    const bX = padX + 80;          // Boiler position
    const bY = padY + 60;
    const tX = w - padX - 100;     // Turbine position
    const tY = padY + 60;
    const cX = w - padX - 100;     // Condenser position
    const cY = h - padY - 70;
    const pX = padX + 80;          // Pump position
    const pY = h - padY - 70;

    ctx.save();
    ctx.lineWidth = 1.2;

    // Pipe 1: Boiler to Turbine (High Pressure, High Temp Superheated Steam - Red/Orange)
    ctx.strokeStyle = isDarkMode ? 'rgba(239, 68, 68, 0.45)' : 'rgba(220, 38, 38, 0.5)';
    ctx.beginPath();
    ctx.moveTo(bX + 45, bY);
    ctx.lineTo(tX - 55, tY);
    ctx.stroke();

    // Pipe 2: Turbine to Condenser (Low Pressure, Exhaust Vapor - Light Blue)
    ctx.strokeStyle = isDarkMode ? 'rgba(56, 189, 248, 0.35)' : 'rgba(2, 132, 199, 0.4)';
    ctx.beginPath();
    ctx.moveTo(tX, tY + 45);
    ctx.lineTo(cX, cY - 45);
    ctx.stroke();

    // Pipe 3: Condenser to Pump (Low Pressure Saturated Liquid Condensate - Deep Blue)
    ctx.strokeStyle = isDarkMode ? 'rgba(0, 242, 254, 0.35)' : 'rgba(14, 165, 233, 0.4)';
    ctx.beginPath();
    ctx.moveTo(cX - 55, cY);
    ctx.lineTo(pX + 45, pY);
    ctx.stroke();

    // Pipe 4: Pump to Boiler (High Pressure Compressed Subcooled Liquid Feedwater - Cyan)
    ctx.strokeStyle = isDarkMode ? 'rgba(16, 185, 129, 0.35)' : 'rgba(5, 150, 105, 0.4)';
    ctx.beginPath();
    ctx.moveTo(pX, pY - 45);
    ctx.lineTo(bX, bY + 55);
    ctx.stroke();

    // Pipe Flanges along transmission conduit paths
    const drawConduitFlange = (fx, fy, vertical = false) => {
      ctx.save();
      ctx.strokeStyle = strokeCol;
      ctx.lineWidth = 1;
      if (vertical) {
        ctx.strokeRect(fx - 6, fy - 2, 12, 4);
      } else {
        ctx.strokeRect(fx - 2, fy - 6, 4, 12);
      }
      ctx.restore();
    };

    drawConduitFlange((bX + tX) * 0.5, bY, false);
    drawConduitFlange(tX, (tY + cY) * 0.5, true);
    drawConduitFlange((cX + pX) * 0.5, cY, false);
    drawConduitFlange(pX, (pY + bY) * 0.5, true);

    // In-Line Isolation & Control Gate Valves
    const drawGateValve = (vx, vy, vertical = false) => {
      ctx.save();
      ctx.translate(vx, vy);
      ctx.strokeStyle = strokeCol;
      ctx.lineWidth = 1;
      if (vertical) ctx.rotate(Math.PI / 2);
      ctx.beginPath();
      ctx.moveTo(-6, -5); ctx.lineTo(6, 5); ctx.lineTo(6, -5); ctx.lineTo(-6, 5);
      ctx.closePath();
      ctx.stroke();
      // Handwheel stem
      ctx.moveTo(0, 0); ctx.lineTo(0, -9);
      ctx.moveTo(-5, -9); ctx.lineTo(5, -9);
      ctx.stroke();
      ctx.restore();
    };

    drawGateValve((bX + tX) * 0.3, bY, false);
    drawGateValve(tX, (tY + cY) * 0.35, true);
    drawGateValve((cX + pX) * 0.7, cY, false);
    drawGateValve(pX, (pY + bY) * 0.65, true);

    // Animate Flow Tracer Particles around Rankine Circuit
    cycleFlowParticles.forEach(p => {
      p.progress = (p.progress + p.speed) % 1;
      let px = 0, py = 0, pColor = strokeCol;

      if (p.progress < 0.25) {
        // Leg 1: Boiler to Turbine (Top)
        const sub = p.progress / 0.25;
        px = (bX + 45) + sub * ((tX - 55) - (bX + 45));
        py = bY;
        pColor = '#ef4444';
      } else if (p.progress < 0.5) {
        // Leg 2: Turbine to Condenser (Right)
        const sub = (p.progress - 0.25) / 0.25;
        px = tX;
        py = (tY + 45) + sub * ((cY - 45) - (tY + 45));
        pColor = '#38bdf8';
      } else if (p.progress < 0.75) {
        // Leg 3: Condenser to Pump (Bottom)
        const sub = (p.progress - 0.5) / 0.25;
        px = (cX - 55) - sub * ((cX - 55) - (pX + 45));
        py = cY;
        pColor = '#00f2fe';
      } else {
        // Leg 4: Pump to Boiler (Left)
        const sub = (p.progress - 0.75) / 0.25;
        px = pX;
        py = (pY - 45) - sub * ((pY - 45) - (bY + 55));
        pColor = '#10b981';
      }

      ctx.fillStyle = pColor;
      ctx.beginPath();
      ctx.arc(px, py, 1.8, 0, Math.PI * 2);
      ctx.fill();
    });

    // Render Component Stations at their schematic vertices
    drawBoilerFurnace(ctx, bX, bY, t, alpha, strokeCol, accentCol);
    drawSteamTurbine(ctx, tX, tY, t, alpha, strokeCol, accentCol);
    drawSurfaceCondenser(ctx, cX, cY, t, alpha, strokeCol, accentCol);
    drawTurbomachinePump(ctx, pX, pY, t, alpha, strokeCol, accentCol);

    // Place extra mechanical mechanisms across inner layout
    const midX = w * 0.5;
    const midY = h * 0.5;

    // Epicyclic planetary gearbox in upper center
    drawPlanetaryGearset(ctx, midX, midY - 110, t, alpha, strokeCol, accentCol);

    // Karman Vortex Shedding in lower left-center
    drawKarmanVortexStreet(ctx, midX - 160, midY + 110, t, alpha, strokeCol, accentCol);

    // Four-Bar Linkage in lower right-center
    drawFourBarLinkage(ctx, midX + 160, midY + 110, t, alpha, strokeCol, accentCol);

    // Venturi meter in central region
    drawVenturiTube(ctx, midX, midY + 10, t, alpha, strokeCol, accentCol);

    ctx.restore();
  }

  // 10. THERMODYNAMIC T-s & P-h VAPOR DOME CHARTS WATERMARK
  function drawThermodynamicCharts(ctx, w, h, alpha, strokeCol) {
    ctx.save();
    // Positioned in top-right ambient background
    const chartX = Math.max(120, w - 240);
    const chartY = 160;

    ctx.translate(chartX, chartY);
    ctx.strokeStyle = strokeCol;
    ctx.lineWidth = 0.8;

    // T-s Axis
    ctx.beginPath();
    ctx.moveTo(0, 0); ctx.lineTo(0, 80); ctx.lineTo(110, 80);
    ctx.stroke();

    ctx.fillStyle = strokeCol;
    ctx.font = '7.5px "Fira Code", monospace';
    ctx.fillText('T (K)', -8, -4);
    ctx.fillText('s (kJ/kg·K)', 90, 92);

    // Bell-shaped saturation vapor dome
    ctx.beginPath();
    ctx.moveTo(10, 80);
    ctx.bezierCurveTo(25, 45, 40, 20, 55, 20); // Saturated liquid line
    ctx.bezierCurveTo(70, 20, 85, 45, 100, 80); // Saturated vapor line
    ctx.stroke();

    // Critical point mark
    ctx.beginPath();
    ctx.arc(55, 20, 1.8, 0, Math.PI * 2);
    ctx.fillStyle = '#ef4444';
    ctx.fill();
    ctx.fillStyle = strokeCol;
    ctx.fillText('Crit. Pt', 58, 18);

    // Superheated Rankine Cycle loop (1-2s-3-4)
    ctx.strokeStyle = '#00f2fe';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(20, 78); // 1: Condenser outlet
    ctx.lineTo(24, 76); // 2: Pump outlet
    ctx.lineTo(55, 26); // Subcooled liquid to boiler
    ctx.lineTo(82, 26); // Phase change latent heat
    ctx.lineTo(95, 12); // Superheater
    ctx.lineTo(95, 78); // Isentropic turbine expansion
    ctx.closePath();
    ctx.stroke();

    ctx.restore();
  }

  // 11. FUNDAMENTAL FLUID & MECHANICAL ENGINEERING FORMULAS
  function drawEngineeringEquations(ctx, w, h, alpha, strokeCol) {
    ctx.save();
    ctx.fillStyle = strokeCol;
    ctx.font = '8px "Fira Code", monospace';

    // NAVIER-STOKES (Incompressible):
    const nsFormula = '∂u/∂t + (u·∇)u = -(1/ρ)∇p + ν∇²u + g';
    ctx.fillText(nsFormula, Math.max(30, w * 0.15), h - 85);

    // FIRST LAW OF THERMODYNAMICS (Open System):
    const thermoFormula = 'q - w = Δh + ½Δ(V²) + gΔz';
    ctx.fillText(thermoFormula, Math.max(30, w * 0.55), h - 85);

    // CONTINUITY EQUATION:
    const contFormula = '∇·(ρu) + ∂ρ/∂t = 0  [MASS CONSERVATION]';
    ctx.fillText(contFormula, Math.max(30, w * 0.15), h - 70);

    // REYNOLDS NUMBER DEFINITION:
    const reFormula = 'Re = (ρ · U · L) / μ = (U · L) / ν';
    ctx.fillText(reFormula, Math.max(30, w * 0.55), h - 70);

    ctx.restore();
  }

  // INTERACTIVE CURSOR BLUEPRINT PROBE / MAGNIFIER RETICLE
  function drawCursorEngineeringProbe(ctx, mx, my, alpha, strokeCol, accentCol) {
    if (mx < 0 || my < 0) return;

    ctx.save();
    ctx.translate(mx, my);

    // Dual concentric technical drafting compass rings
    ctx.strokeStyle = accentCol;
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.arc(0, 0, 24, 0, Math.PI * 2);
    ctx.stroke();

    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.arc(0, 0, 36, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // 4 Crosshair ticks with vernier marks
    ctx.beginPath();
    ctx.moveTo(-42, 0); ctx.lineTo(-24, 0);
    ctx.moveTo(24, 0); ctx.lineTo(42, 0);
    ctx.moveTo(0, -42); ctx.lineTo(0, -24);
    ctx.moveTo(0, 24); ctx.lineTo(0, 42);
    ctx.stroke();

    // Coordinates HUD tag
    ctx.fillStyle = isDarkMode ? 'rgba(15, 23, 42, 0.88)' : 'rgba(255, 255, 255, 0.88)';
    ctx.fillRect(16, 16, 92, 28);
    ctx.strokeStyle = accentCol;
    ctx.strokeRect(16, 16, 92, 28);

    ctx.fillStyle = accentCol;
    ctx.font = '7.5px "Fira Code", monospace';
    ctx.fillText(`X: ${Math.round(mx)} mm`, 22, 28);
    ctx.fillText(`Y: ${Math.round(my)} mm`, 22, 38);

    ctx.restore();
  }

  // MAIN RENDER LOOP
  function render() {
    animTime += 0.016;

    // Smooth cursor follower
    if (targetMouseX > 0) {
      mouseX += (targetMouseX - mouseX) * 0.1;
      mouseY += (targetMouseY - mouseY) * 0.1;
    }

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);

    // Dynamic contrast styling for Dark vs Light mode
    const primaryAlpha = isDarkMode ? 0.85 : 0.75;
    const strokeCol = isDarkMode ? 'rgba(148, 163, 184, 0.38)' : 'rgba(71, 85, 105, 0.42)';
    const accentCol = isDarkMode ? 'rgba(0, 242, 254, 0.65)' : 'rgba(2, 132, 199, 0.75)';

    // 1. Technical Coordinate Blueprint Grid
    drawBlueprintGrid(ctx, width, height, primaryAlpha, accentCol);

    // 2. Complete Rankine Circuit & Components
    drawFullRankineCycleCircuit(ctx, width, height, animTime, primaryAlpha, strokeCol, accentCol);

    // 3. Thermodynamic State Coordinate Diagrams
    drawThermodynamicCharts(ctx, width, height, primaryAlpha, strokeCol);

    // 4. Fundamental Engineering Equations
    drawEngineeringEquations(ctx, width, height, primaryAlpha, strokeCol);

    // 5. Interactive Cursor Inspection Reticle
    drawCursorEngineeringProbe(ctx, mouseX, mouseY, primaryAlpha, strokeCol, accentCol);

    ctx.restore();
    requestAnimationFrame(render);
  }

  // Start animation
  requestAnimationFrame(render);
})();
