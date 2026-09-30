import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fs from 'fs';
import path from 'path';

async function generateBgdPdf() {
  const pdfDoc = await PDFDocument.create();
  const fontHelvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontHelveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontCourier = await pdfDoc.embedFont(StandardFonts.Courier);
  const fontCourierBold = await pdfDoc.embedFont(StandardFonts.CourierBold);

  const primaryCyan = rgb(0 / 255, 180 / 255, 216 / 255);
  const darkNavy = rgb(10 / 255, 25 / 255, 47 / 255);
  const charcoal = rgb(33 / 255, 37 / 255, 41 / 255);
  const mutedGray = rgb(108 / 255, 117 / 255, 125 / 255);
  const borderGray = rgb(220 / 255, 225 / 255, 230 / 255);
  const bgLight = rgb(248 / 255, 249 / 255, 250 / 255);

  const pageWidth = 595.28;
  const pageHeight = 841.89; // A4 standard

  function addHeaderFooter(page, pageNum, totalPages, titleText) {
    if (pageNum === 1) return; // Skip cover page

    // Top Header line
    page.drawLine({
      start: { x: 45, y: pageHeight - 40 },
      end: { x: pageWidth - 45, y: pageHeight - 40 },
      thickness: 0.8,
      color: primaryCyan,
    });

    page.drawText('GAS DYNAMICS (BGD)  //  COMPREHENSIVE LECTURE COMPENDIUM', {
      x: 45,
      y: pageHeight - 34,
      size: 8,
      font: fontHelveticaBold,
      color: primaryCyan,
    });

    page.drawText(titleText || 'DEPARTMENT OF MECHANICAL & AEROSPACE ENGINEERING', {
      x: pageWidth - 265,
      y: pageHeight - 34,
      size: 7.5,
      font: fontHelvetica,
      color: mutedGray,
    });

    // Bottom Footer line
    page.drawLine({
      start: { x: 45, y: 45 },
      end: { x: pageWidth - 45, y: 45 },
      thickness: 0.8,
      color: borderGray,
    });

    page.drawText('FluidMind Engineering Library  •  Gas Dynamics Booklet  •  BGD Reference', {
      x: 45,
      y: 32,
      size: 8,
      font: fontHelvetica,
      color: mutedGray,
    });

    const pageStr = `Page ${pageNum} of ${totalPages}`;
    page.drawText(pageStr, {
      x: pageWidth - 45 - fontHelvetica.widthOfTextAtSize(pageStr, 8),
      y: 32,
      size: 8,
      font: fontHelveticaBold,
      color: darkNavy,
    });
  }

  // --- PAGE 1: COVER PAGE ---
  const coverPage = pdfDoc.addPage([pageWidth, pageHeight]);

  // Deep Navy Background Accent Banner
  coverPage.drawRectangle({
    x: 0,
    y: pageHeight - 220,
    width: pageWidth,
    height: 220,
    color: darkNavy,
  });

  // Cyan highlight stripe
  coverPage.drawRectangle({
    x: 0,
    y: pageHeight - 226,
    width: pageWidth,
    height: 6,
    color: primaryCyan,
  });

  // Top header text
  coverPage.drawText('ACADEMIC ENGINEERING SERIES  •  SPECIALIZED COURSE NOTES', {
    x: 50,
    y: pageHeight - 65,
    size: 9,
    font: fontHelveticaBold,
    color: primaryCyan,
  });

  coverPage.drawText('GAS DYNAMICS', {
    x: 50,
    y: pageHeight - 115,
    size: 34,
    font: fontHelveticaBold,
    color: rgb(1, 1, 1),
  });

  coverPage.drawText('COMPRESSIBLE FLOW & AEROTHERMODYNAMICS (BGD NOTES)', {
    x: 50,
    y: pageHeight - 148,
    size: 13,
    font: fontHelveticaBold,
    color: rgb(220 / 255, 240 / 255, 255 / 255),
  });

  coverPage.drawText('Isentropic Nozzle Flow, Normal/Oblique Shocks, Fanno/Rayleigh Flow & Propulsion', {
    x: 50,
    y: pageHeight - 176,
    size: 9.5,
    font: fontHelvetica,
    color: rgb(170 / 255, 195 / 255, 220 / 255),
  });

  // Metadata Card
  coverPage.drawRectangle({
    x: 50,
    y: pageHeight - 340,
    width: pageWidth - 100,
    height: 85,
    color: bgLight,
    borderColor: borderGray,
    borderWidth: 1,
  });

  coverPage.drawText('DOCUMENT SPECIFICATIONS & COURSE INFORMATION', {
    x: 65,
    y: pageHeight - 275,
    size: 9,
    font: fontHelveticaBold,
    color: darkNavy,
  });

  const specs = [
    ['Course Title:', 'Gas Dynamics & Compressible Flow (BGD Booklet)'],
    ['Subject Area:', 'Fluid Mechanics, Thermodynamics & Aerospace Propulsion'],
    ['Curated For:', 'Mechanical & Aerospace Engineering Students and Researchers'],
    ['Reference Code:', 'BGD-GASDYN-2026-VOL09'],
    ['Library Source:', 'FluidMind Scientific Library // Mohammadamin Sharif']
  ];

  let specY = pageHeight - 295;
  for (const [k, v] of specs) {
    coverPage.drawText(k, { x: 65, y: specY, size: 8, font: fontHelveticaBold, color: charcoal });
    coverPage.drawText(v, { x: 165, y: specY, size: 8, font: fontHelvetica, color: mutedGray });
    specY -= 12;
  }

  // Table of Contents Preview Box
  coverPage.drawRectangle({
    x: 50,
    y: 80,
    width: pageWidth - 100,
    height: 380,
    color: rgb(1, 1, 1),
    borderColor: borderGray,
    borderWidth: 1,
  });

  coverPage.drawText('SYLLABUS & MODULE OUTLINE // COURSE STRUCTURE', {
    x: 70,
    y: 430,
    size: 11,
    font: fontHelveticaBold,
    color: darkNavy,
  });

  coverPage.drawLine({
    start: { x: 70, y: 420 },
    end: { x: pageWidth - 70, y: 420 },
    thickness: 1,
    color: primaryCyan,
  });

  const modules = [
    { num: 'MOD 01', title: 'Fundamental Concepts of Compressible Flow', desc: 'Speed of Sound, Mach Number, Stagnation State, Perfect Gas Relations' },
    { num: 'MOD 02', title: 'One-Dimensional Isentropic Flow & Nozzles', desc: 'Area-Velocity Relation, Converging-Diverging (de Laval) Nozzle, Choking' },
    { num: 'MOD 03', title: 'Normal Shock Waves in Supersonic Ducts', desc: 'Rankine-Hugoniot Equations, Total Pressure Losses, Entropy Generation' },
    { num: 'MOD 04', title: 'Oblique Shock Waves & Prandtl-Meyer Expansion', desc: 'Theta-Beta-M Relations, Shock Reflection, Diamond Airfoils in Supersonic Flow' },
    { num: 'MOD 05', title: 'Adiabatic Flow with Friction (Fanno Flow)', desc: 'Fanno Line, Choking due to Wall Friction, Maximum Duct Length' },
    { num: 'MOD 06', title: 'Frictionless Flow with Heat Addition (Rayleigh Flow)', desc: 'Rayleigh Line, Thermal Choking, Maximum Heat Transfer Limits' },
    { num: 'MOD 07', title: 'Aerospace Propulsion & Supersonic Inlets', desc: 'Diffusers, Over/Under Expanded Nozzles, Rocket Exhaust Expansion' }
  ];

  let modY = 395;
  for (const m of modules) {
    coverPage.drawRectangle({
      x: 70,
      y: modY - 2,
      width: 48,
      height: 14,
      color: primaryCyan,
    });
    coverPage.drawText(m.num, { x: 74, y: modY + 2, size: 7.5, font: fontHelveticaBold, color: rgb(1, 1, 1) });
    coverPage.drawText(m.title, { x: 126, y: modY + 2, size: 9, font: fontHelveticaBold, color: darkNavy });
    coverPage.drawText(m.desc, { x: 126, y: modY - 10, size: 7.5, font: fontHelvetica, color: mutedGray });
    modY -= 38;
  }

  // --- PAGE 2: CHAPTER 1 & 2 (FUNDAMENTALS & ISENTROPIC FLOW) ---
  const p2 = pdfDoc.addPage([pageWidth, pageHeight]);

  let y = pageHeight - 70;
  p2.drawText('CHAPTER 1: FUNDAMENTAL PRINCIPLES & SOUND SPEED', {
    x: 45, y, size: 14, font: fontHelveticaBold, color: darkNavy
  });
  y -= 8;
  p2.drawLine({ start: { x: 45, y }, end: { x: pageWidth - 45, y }, thickness: 1.5, color: primaryCyan });
  y -= 22;

  const ch1Intro = [
    'Compressible fluid dynamics governs flows where density variation (d rho / rho) is substantial,',
    'typically occurring when the flow velocity approaches or exceeds the local acoustic velocity (Mach > 0.3).',
    'Under these regimes, thermodynamics and fluid kinematics become inextricably coupled through state equations.'
  ];
  for (const line of ch1Intro) {
    p2.drawText(line, { x: 45, y, size: 9, font: fontHelvetica, color: charcoal });
    y -= 14;
  }
  y -= 8;

  // Formula box 1
  p2.drawRectangle({ x: 45, y: y - 55, width: pageWidth - 90, height: 60, color: bgLight, borderColor: primaryCyan, borderWidth: 1 });
  p2.drawText('GOVERNING THERMODYNAMIC RELATIONS FOR COMPRESSIBLE GAS', { x: 55, y: y - 12, size: 8, font: fontCourierBold, color: primaryCyan });
  p2.drawText('• Speed of Sound: a = sqrt(gamma * R * T)', { x: 55, y: y - 26, size: 9, font: fontCourierBold, color: darkNavy });
  p2.drawText('• Mach Number:    M = V / a', { x: 55, y: y - 38, size: 9, font: fontCourierBold, color: darkNavy });
  p2.drawText('• Stagnation T:   T_0 / T = 1 + [(gamma - 1) / 2] * M^2', { x: 55, y: y - 50, size: 9, font: fontCourierBold, color: darkNavy });
  y -= 75;

  p2.drawText('CHAPTER 2: ONE-DIMENSIONAL ISENTROPIC FLOW & NOZZLES', {
    x: 45, y, size: 14, font: fontHelveticaBold, color: darkNavy
  });
  y -= 8;
  p2.drawLine({ start: { x: 45, y }, end: { x: pageWidth - 45, y }, thickness: 1.5, color: primaryCyan });
  y -= 22;

  const ch2Content = [
    'In isentropic flow, entropy is conserved (ds = 0), and total pressure and stagnation temperature remain',
    'constant throughout the streamline. The differential area-velocity relationship dictates geometric effects:',
    '  dA / A = (M^2 - 1) * (dV / V)',
    'This fundamental law reveals why supersonic acceleration requires a diverging duct, contrasting directly',
    'with intuitive incompressible flow behavior.'
  ];
  for (const line of ch2Content) {
    p2.drawText(line, { x: 45, y, size: 9, font: fontHelvetica, color: charcoal });
    y -= 14;
  }
  y -= 8;

  // Isentropic relations table
  p2.drawRectangle({ x: 45, y: y - 110, width: pageWidth - 90, height: 115, color: bgLight, borderColor: borderGray, borderWidth: 1 });
  p2.drawText('KEY ISENTROPIC FLOW RELATIONS (IDEAL GAS, gamma = 1.4)', { x: 55, y: y - 12, size: 8.5, font: fontHelveticaBold, color: darkNavy });
  
  const isenEqs = [
    '1. Pressure Ratio:      P_0 / P   = [ 1 + (gamma-1)/2 * M^2 ]^(gamma / (gamma-1))',
    '2. Density Ratio:       rho_0 / rho = [ 1 + (gamma-1)/2 * M^2 ]^(1 / (gamma-1))',
    '3. Critical Pressure:   P* / P_0  = [ 2 / (gamma + 1) ]^(gamma / (gamma-1)) = 0.52828 (for air)',
    '4. Critical Temp:       T* / T_0  = 2 / (gamma + 1) = 0.83333',
    '5. Area-Mach Relation:  A / A*    = (1/M) * [ (2 / (gamma+1)) * (1 + (gamma-1)/2 * M^2) ]^((gamma+1)/(2*(gamma-1)))',
    '6. Maximum Mass Flux:   m_dot_max = (P_0 * A* / sqrt(T_0)) * sqrt(gamma/R) * [ 2/(gamma+1) ]^((gamma+1)/(2*(gamma-1)))'
  ];
  let eqY = y - 28;
  for (const eq of isenEqs) {
    p2.drawText(eq, { x: 55, y: eqY, size: 8, font: fontCourier, color: darkNavy });
    eqY -= 14;
  }
  y -= 135;

  // De Laval Nozzle Note Box
  p2.drawRectangle({ x: 45, y: y - 75, width: pageWidth - 90, height: 80, color: rgb(240/255, 249/255, 255/255), borderColor: primaryCyan, borderWidth: 1 });
  p2.drawText('ENGINEERING HIGHLIGHT: CONVERGING-DIVERGING (DE LAVAL) NOZZLE', { x: 55, y: y - 14, size: 8.5, font: fontHelveticaBold, color: primaryCyan });
  const deLavalNotes = [
    '• For subsonic entry (M < 1), a converging section accelerates the fluid toward the throat.',
    '• Choked flow condition (M = 1) is achieved strictly at the minimum cross-sectional area (throat, A*).',
    '• Further expansion into supersonic velocities (M > 1) strictly necessitates a diverging nozzle section.',
    '• If backpressure Pb > design exit pressure Pe, normal shocks or oblique shocks form inside or outside.'
  ];
  let dlY = y - 28;
  for (const n of deLavalNotes) {
    p2.drawText(n, { x: 55, y: dlY, size: 8, font: fontHelvetica, color: charcoal });
    dlY -= 12;
  }

  // --- PAGE 3: NORMAL & OBLIQUE SHOCKS ---
  const p3 = pdfDoc.addPage([pageWidth, pageHeight]);
  y = pageHeight - 70;

  p3.drawText('CHAPTER 3: NORMAL SHOCK WAVES IN COMPRESSIBLE FLOW', {
    x: 45, y, size: 14, font: fontHelveticaBold, color: darkNavy
  });
  y -= 8;
  p3.drawLine({ start: { x: 45, y }, end: { x: pageWidth - 45, y }, thickness: 1.5, color: primaryCyan });
  y -= 22;

  const ch3Content = [
    'A normal shock wave is an extremely thin discontinuity (order of mean free path ~ 10^-5 cm) across which',
    'flow velocity drops precipitously from supersonic (M1 > 1) to subsonic (M2 < 1), with concomitant jumps in',
    'static pressure, temperature, and entropy. Stagnation temperature T_0 is preserved, but total pressure P_0 drops.'
  ];
  for (const line of ch3Content) {
    p3.drawText(line, { x: 45, y, size: 9, font: fontHelvetica, color: charcoal });
    y -= 14;
  }
  y -= 8;

  // Normal shock formulas box
  p3.drawRectangle({ x: 45, y: y - 110, width: pageWidth - 90, height: 115, color: bgLight, borderColor: borderGray, borderWidth: 1 });
  p3.drawText('RANKINE-HUGONIOT NORMAL SHOCK FORMULATIONS (gamma = 1.4)', { x: 55, y: y - 12, size: 8.5, font: fontHelveticaBold, color: darkNavy });
  
  const shockEqs = [
    '1. Downstream Mach:    M_2^2      = [ 2 + (gamma - 1)*M_1^2 ] / [ 2*gamma*M_1^2 - (gamma - 1) ]',
    '2. Static Pressure:    P_2 / P_1  = 1 + [ 2*gamma / (gamma + 1) ] * (M_1^2 - 1)',
    '3. Static Temperature: T_2 / T_1  = [ 1 + (2*gamma/(gamma+1))*(M_1^2-1) ] * [ (2 + (gamma-1)*M_1^2)/((gamma+1)*M_1^2) ]',
    '4. Density Jump:       rho2/rho1  = [ (gamma + 1)*M_1^2 ] / [ 2 + (gamma - 1)*M_1^2 ]',
    '5. Total Pressure Loss:P_02 / P_01= [ (gamma+1)*M_1^2 / (2 + (gamma-1)*M_1^2) ]^(gamma/(gamma-1)) * [ (gamma+1)/(2*gamma*M_1^2 - (gamma-1)) ]^(1/(gamma-1))',
    '6. Entropy Generation: s_2 - s_1  = -R * ln( P_02 / P_01 ) > 0  (Always positive for irreversible shock)'
  ];
  eqY = y - 28;
  for (const eq of shockEqs) {
    p3.drawText(eq, { x: 55, y: eqY, size: 8, font: fontCourier, color: darkNavy });
    eqY -= 14;
  }
  y -= 135;

  p3.drawText('CHAPTER 4: OBLIQUE SHOCKS & PRANDTL-MEYER EXPANSION', {
    x: 45, y, size: 14, font: fontHelveticaBold, color: darkNavy
  });
  y -= 8;
  p3.drawLine({ start: { x: 45, y }, end: { x: pageWidth - 45, y }, thickness: 1.5, color: primaryCyan });
  y -= 22;

  const ch4Content = [
    'When supersonic flow encounters a concave corner or wedge of angle theta, an oblique shock forms at',
    'an angle beta. The normal component of Mach number governs the shock jump, while the tangential component',
    'remains constant across the shock surface.',
    '  tan(theta) = 2 * cot(beta) * [ (M_1^2 * sin^2(beta) - 1) / (M_1^2 * (gamma + cos(2*beta)) + 2) ]',
    'Conversely, supersonic flow expanding around a convex corner generates a Prandtl-Meyer expansion fan,',
    'an isentropic expansion where Mach increases and pressure drops smoothly according to the Prandtl-Meyer function nu(M).'
  ];
  for (const line of ch4Content) {
    p3.drawText(line, { x: 45, y, size: 9, font: fontHelvetica, color: charcoal });
    y -= 14;
  }
  y -= 8;

  // Summary box of shock types
  p3.drawRectangle({ x: 45, y: y - 80, width: pageWidth - 90, height: 85, color: bgLight, borderColor: primaryCyan, borderWidth: 1 });
  p3.drawText('OBLIQUE SHOCK & EXPANSION FAN CRITICAL RULES', { x: 55, y: y - 14, size: 8.5, font: fontHelveticaBold, color: primaryCyan });
  const shockNotes = [
    '• Strong vs. Weak Shock: For a given deflection angle theta, two beta angles exist. Weak shock is natural in unconfined flow.',
    '• Shock Detachment: If theta exceeds theta_max for a given M1, the shock detaches and becomes a curved bow shock.',
    '• Prandtl-Meyer Function: nu(M) = sqrt((gamma+1)/(gamma-1)) * atan(sqrt((gamma-1)/(gamma+1)*(M^2-1))) - atan(sqrt(M^2-1)).',
    '• Expansion Relation: nu(M_2) = nu(M_1) + theta (Flow expands isentropically, total pressure is fully preserved).'
  ];
  let snY = y - 28;
  for (const s of shockNotes) {
    p3.drawText(s, { x: 55, y: snY, size: 8, font: fontHelvetica, color: charcoal });
    snY -= 12;
  }

  // --- PAGE 4: FANNO & RAYLEIGH FLOW + AEROSPACE APPLICATIONS ---
  const p4 = pdfDoc.addPage([pageWidth, pageHeight]);
  y = pageHeight - 70;

  p4.drawText('CHAPTER 5 & 6: FANNO FLOW (FRICTION) & RAYLEIGH FLOW (HEAT)', {
    x: 45, y, size: 14, font: fontHelveticaBold, color: darkNavy
  });
  y -= 8;
  p4.drawLine({ start: { x: 45, y }, end: { x: pageWidth - 45, y }, thickness: 1.5, color: primaryCyan });
  y -= 22;

  // Comparison grid
  p4.drawRectangle({ x: 45, y: y - 130, width: (pageWidth - 100)/2, height: 135, color: bgLight, borderColor: borderGray, borderWidth: 1 });
  p4.drawText('FANNO FLOW (Friction, Adiabatic)', { x: 55, y: y - 14, size: 9, font: fontHelveticaBold, color: darkNavy });
  const fannoPoints = [
    '• Constant Area Duct + Wall Friction',
    '• Stagnation Temp T_0 = Constant',
    '• Stagnation Pressure P_0 Decreases',
    '• Subsonic flow accelerates toward M=1',
    '• Supersonic flow decelerates toward M=1',
    '• Friction Choking: L = L_max (Critical length)',
    '• 4fL*/D = (1-M^2)/(gamma*M^2) + ((gamma+1)/2gamma)*ln[((gamma+1)M^2)/(2+(gamma-1)M^2)]'
  ];
  let fpY = y - 30;
  for (const p of fannoPoints) {
    p4.drawText(p, { x: 55, y: fpY, size: 7.5, font: fontHelvetica, color: charcoal });
    fpY -= 13;
  }

  const col2X = 55 + (pageWidth - 100)/2;
  p4.drawRectangle({ x: col2X - 5, y: y - 130, width: (pageWidth - 100)/2, height: 135, color: bgLight, borderColor: borderGray, borderWidth: 1 });
  p4.drawText('RAYLEIGH FLOW (Heat Addition, Frictionless)', { x: col2X + 5, y: y - 14, size: 9, font: fontHelveticaBold, color: darkNavy });
  const rayleighPoints = [
    '• Constant Area Duct + Heat Exchange (q)',
    '• T_0 Changes: q = cp * (T_02 - T_01)',
    '• Heating drives Mach toward M=1',
    '• Cooling drives Mach away from M=1',
    '• Thermal Choking: q = q_max',
    '• T_0/T_0* = [ 2(gamma+1)M^2 (1+(gamma-1)M^2/2) ] / (1+gamma*M^2)^2',
    '• P/P* = (gamma + 1) / (1 + gamma * M^2)'
  ];
  let rpY = y - 30;
  for (const p of rayleighPoints) {
    p4.drawText(p, { x: col2X + 5, y: rpY, size: 7.5, font: fontHelvetica, color: charcoal });
    rpY -= 13;
  }
  y -= 155;

  p4.drawText('CHAPTER 7: PROPULSION & AEROSPACE NOZZLE REGIMES', {
    x: 45, y, size: 14, font: fontHelveticaBold, color: darkNavy
  });
  y -= 8;
  p4.drawLine({ start: { x: 45, y }, end: { x: pageWidth - 45, y }, thickness: 1.5, color: primaryCyan });
  y -= 22;

  const ch7Content = [
    'In rocket propulsion and supersonic aircraft exhaust nozzles, the relationship between exit pressure (Pe)',
    'and ambient atmospheric backpressure (Pb) establishes three distinct operational regimes:',
    '1. Correctly Expanded (Pe = Pb): Optimum performance, parallel jet boundary, highest thrust coefficient.',
    '2. Under-Expanded (Pe > Pb): Gas continues to expand outside nozzle via expansion fans (high altitude).',
    '3. Over-Expanded (Pe < Pb): Ambient pressure pinches the plume, producing oblique shock compression rings and Mach diamonds.'
  ];
  for (const line of ch7Content) {
    p4.drawText(line, { x: 45, y, size: 9, font: fontHelvetica, color: charcoal });
    y -= 14;
  }
  y -= 8;

  // Reference Tables Box
  p4.drawRectangle({ x: 45, y: y - 110, width: pageWidth - 90, height: 115, color: bgLight, borderColor: primaryCyan, borderWidth: 1 });
  p4.drawText('STANDARD GAS DYNAMICS ISENTROPIC & NORMAL SHOCK BENCHMARK TABLE (AIR gamma = 1.4)', { x: 55, y: y - 14, size: 8, font: fontHelveticaBold, color: darkNavy });
  
  const tableRows = [
    'Mach (M1)   |  T/T0     |  P/P0      |  A/A*    |  M2 (Shock) |  P2/P1    |  P02/P01',
    '----------------------------------------------------------------------------------',
    '0.50        |  0.9524   |  0.8430    |  1.3398  |  (Subsonic) |  -----    |  1.00000',
    '1.00 (Sonic)|  0.8333   |  0.5283    |  1.0000  |  1.0000     |  1.000    |  1.00000',
    '1.50        |  0.6897   |  0.2724    |  1.1762  |  0.7011     |  2.458    |  0.92978',
    '2.00        |  0.5556   |  0.1278    |  1.6875  |  0.5774     |  4.500    |  0.72087',
    '2.50        |  0.4444   |  0.0585    |  2.6367  |  0.5130     |  7.125    |  0.49901',
    '3.00        |  0.3571   |  0.0272    |  4.2346  |  0.4752     | 10.333    |  0.32834'
  ];
  let tbY = y - 28;
  for (const r of tableRows) {
    p4.drawText(r, { x: 55, y: tbY, size: 7.5, font: fontCourierBold, color: darkNavy });
    tbY -= 11;
  }

  // Add Headers & Footers
  const totalPages = 4;
  addHeaderFooter(coverPage, 1, totalPages, '');
  addHeaderFooter(p2, 2, totalPages, 'MODULE 1 & 2: ISENTROPIC FLOW');
  addHeaderFooter(p3, 3, totalPages, 'MODULE 3 & 4: NORMAL & OBLIQUE SHOCKS');
  addHeaderFooter(p4, 4, totalPages, 'MODULE 5, 6 & 7: PROPULSION & DICTIONARY');

  const pdfBytes = await pdfDoc.save();

  // Write to destination paths
  const paths = [
    path.join(process.cwd(), 'assets/downloads/books/gas-dynamics/BGD.pdf'),
    path.join(process.cwd(), 'assets/downloads/books/gas-dynamics/gas-dynamics-lecture-notes.pdf'),
    path.join(process.cwd(), 'BGD.pdf'),
    path.join(process.cwd(), 'books/BGD.pdf')
  ];

  for (const p of paths) {
    fs.mkdirSync(path.dirname(p), { recursive: true });
    fs.writeFileSync(p, pdfBytes);
    console.log(`Saved PDF to: ${p} (${pdfBytes.length} bytes)`);
  }
}

generateBgdPdf().catch(err => {
  console.error('Error generating PDF:', err);
  process.exit(1);
});
