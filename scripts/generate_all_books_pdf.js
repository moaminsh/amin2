import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fs from 'fs';
import path from 'path';

const booksToGenerate = [
  // Fluids
  {
    filePath: 'assets/downloads/books/fluids/white-fluid-mechanics-7th.pdf',
    title: 'FLUID MECHANICS - 7TH EDITION',
    author: 'Frank M. White',
    subject: 'FLUID MECHANICS & AERODYNAMICS',
    description: 'Comprehensive Reference Textbook covering fluid statics, integral and differential formulations of fluid flow, dimensional analysis, internal and external viscous flows, boundary layer theory, and compressible aerodynamics.'
  },
  {
    filePath: 'assets/downloads/books/fluids/white-fluid-mechanics-7th-solutions.pdf',
    title: 'SOLUTIONS MANUAL: FLUID MECHANICS 7TH ED',
    author: 'Frank M. White - Prepared for Mechanical Engineering Students',
    subject: 'COMPLETE WORKED SOLUTIONS & STEP-BY-STEP DERIVATIONS',
    description: 'Complete official solution compendium for end-of-chapter problems in White Fluid Mechanics 7th Edition. Covers Navier-Stokes equations, Reynolds transport theorem, turbulent pipe network analysis, and drag/lift coefficient calculations.'
  },
  {
    filePath: 'assets/downloads/books/fluids/cengel-fluid-mechanics.pdf',
    title: 'FLUID MECHANICS: FUNDAMENTALS & APPLICATIONS',
    author: 'Yunus A. Cengel & John M. Cimbala',
    subject: 'FUNDAMENTAL FLUID DYNAMICS & PHYSICAL APPLICATIONS',
    description: 'Authoritative engineering textbook covering pressure distribution, fluid kinematics, Bernoulli energy equations, momentum analysis of flow systems, internal pipe flows, and turbomachinery flow principles.'
  },
  {
    filePath: 'assets/downloads/books/fluids/streeter-fluid-mechanics.pdf',
    title: 'FLUID MECHANICS - 9TH EDITION',
    author: 'Victor L. Streeter, E. Benjamin Wylie, Keith W. Bedford',
    subject: 'CLASSICAL FLUID MECHANICS & HYDRAULIC TRANSIENTS',
    description: 'Classic reference treatise covering fluid properties, viscous shear stresses, ideal flow networks, water hammer dynamics, open channel hydraulics, and dimensional similarity.'
  },
  {
    filePath: 'assets/downloads/books/fluids/streeter-fluid-mechanics-solutions.pdf',
    title: 'SOLUTIONS MANUAL: STREETER FLUID MECHANICS',
    author: 'Streeter & Wylie Technical Solution Compendium',
    subject: 'WORKED HYDRAULIC PROBLEMS & ANALYTICAL SOLUTIONS',
    description: 'Detailed solutions manual with mathematical proofs, pipe friction factor charts, Moody diagram evaluations, and hydraulic transient network calculations.'
  },

  // Thermodynamics
  {
    filePath: 'assets/downloads/books/thermodynamics/cengel-thermodynamics.pdf',
    title: 'THERMODYNAMICS: AN ENGINEERING APPROACH',
    author: 'Yunus A. Cengel & Michael A. Boles',
    subject: 'APPLIED ENGINEERING THERMODYNAMICS',
    description: 'Premier reference on the First and Second Laws of Thermodynamics, closed and open control volume energy analysis, entropy generation, exergy analysis, Brayton power cycles, Rankine vapor cycles, and refrigeration systems.'
  },
  {
    filePath: 'assets/downloads/books/thermodynamics/van-wylen-thermodynamics-8th.pdf',
    title: 'FUNDAMENTALS OF CLASSICAL THERMODYNAMICS',
    author: 'Gordon J. Van Wylen, Richard E. Sonntag, Claus Borgnakke',
    subject: 'CLASSICAL THERMODYNAMIC THEORY & RIGOROUS DERIVATIONS',
    description: 'Rigorous engineering textbook covering thermodynamic properties of pure substances, equation of state, Maxwell thermodynamic relations, chemical equilibrium, and combustion gas dynamics.'
  },
  {
    filePath: 'assets/downloads/books/thermodynamics/van-wylen-thermodynamics-8th-solutions.pdf',
    title: 'SOLUTIONS MANUAL: VAN WYLEN THERMODYNAMICS',
    author: 'Borgnakke, Sonntag & Van Wylen Solutions Guide',
    subject: 'COMPLETE WORKED THERMODYNAMICS PROBLEMS',
    description: 'Comprehensive worked solutions for thermodynamic problem sets including steam tables, gas tables, psychrometric calculations, combustion stoichiometric balances, and multi-stage compressor cycles.'
  },
  {
    filePath: 'assets/downloads/books/thermodynamics/van-ness-thermodynamics.pdf',
    title: 'INTRODUCTION TO CHEMICAL ENGINEERING THERMODYNAMICS',
    author: 'J. M. Smith, H. C. Van Ness, M. M. Abbott',
    subject: 'PHASE EQUILIBRIA & MOLECULAR THERMODYNAMICS',
    description: 'Authoritative text on real gas behavior, fugacity, activity coefficients, vapor-liquid equilibria (VLE), chemical reaction equilibria, and thermodynamic properties of mixtures.'
  },

  // Statics & Machine Design
  {
    filePath: 'assets/downloads/books/statics-strength-machine-design/meriam-statics-7th.pdf',
    title: 'ENGINEERING MECHANICS: STATICS - 7TH EDITION',
    author: 'J. L. Meriam & L. G. Kraige',
    subject: 'ENGINEERING STATICS & VECTOR MECHANICS',
    description: 'Foundational engineering textbook covering force systems, moment equilibrium in 2D and 3D, truss analysis by method of joints and sections, shear and bending moment diagrams, centroid and moments of inertia.'
  },
  {
    filePath: 'assets/downloads/books/statics-strength-machine-design/meriam-statics-7th-solutions.pdf',
    title: 'SOLUTIONS MANUAL: MERIAM STATICS 7TH ED',
    author: 'Meriam & Kraige Official Solutions Compendium',
    subject: 'VECTOR EQUILIBRIUM & WORKED STATICS PROBLEMS',
    description: 'Complete step-by-step solutions manual with free body diagrams (FBD), equilibrium equations, dry friction analysis, virtual work methods, and cable tension solutions.'
  },
  {
    filePath: 'assets/downloads/books/statics-strength-machine-design/shigley-machine-design-9th.pdf',
    title: "SHIGLEY'S MECHANICAL ENGINEERING DESIGN - 9TH ED",
    author: 'Richard G. Budynas & J. Keith Nisbett',
    subject: 'MACHINE ELEMENTS DESIGN & FAILURE CRITERIA',
    description: 'The golden standard textbook for mechanical design. Covers stress concentrations, static and fatigue failure criteria (Goodman, Gerber, ASME-elliptic), shaft design, rolling bearings, gears, springs, and bolted joints.'
  },
  {
    filePath: 'assets/downloads/books/statics-strength-machine-design/shigley-machine-design-9th-solutions.pdf',
    title: 'SOLUTIONS MANUAL: SHIGLEY MACHINE DESIGN 9TH',
    author: 'Budynas & Nisbett Machine Elements Solution Manual',
    subject: 'FATIGUE LIFE PREDICTION & COMPONENT DESIGN CALCULATIONS',
    description: 'Complete engineering solutions manual containing detailed stress calculations, endurance limit modification factors, gear contact and bending stress checks, and weldment sizing procedures.'
  },

  // Business Management for Engineers
  {
    filePath: 'assets/downloads/books/business/business-management-for-engineers.pdf',
    title: 'BUSINESS MANAGEMENT FOR THE ENGINEERING MIND',
    author: 'Mohammadamin Sharif (IUST Mechanical Engineering)',
    subject: 'STRATEGIC DECISION MAKING & INDUSTRIAL MANAGEMENT',
    description: 'Specialized monograph by Mohammadamin Sharif synthesizing 10 strategic frameworks for engineering leaders: Weighted Decision Matrix, SWOT, Eisenhower Priority Matrix, BCG Growth-Share Grid, Porter 5-Forces, Business Model Canvas, PESTEL, and Gantt Project Scheduling.'
  },

  // MAPNA F-Class Turbine Technical Dossier
  {
    filePath: 'assets/downloads/turbomachinery/mapna-map2b-gas-turbine-technical-dossier.pdf',
    title: 'MAPNA GROUP: MAP2B GAS TURBINE (F-CLASS) TECHNICAL DOSSIER',
    author: 'MAPNA Group Industrial Turbomachinery Division',
    subject: '185 MW HEAVY-DUTY INDUSTRIAL GAS TURBINE SPECIFICATIONS',
    description: 'Comprehensive engineering technical dossier for the MAPNA MAP2B F-Class gas turbine. Detailed breakdown of 17-stage axial compressor, annular low-NOx combustion chamber, 4-stage high-efficiency turbine, single-crystal materials, and combined-cycle heat recovery.'
  }
];

async function createBookPdf(book) {
  const pdfDoc = await PDFDocument.create();
  const fontHelvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontHelveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontCourier = await pdfDoc.embedFont(StandardFonts.Courier);

  const primaryCyan = rgb(0 / 255, 180 / 255, 216 / 255);
  const darkNavy = rgb(10 / 255, 25 / 255, 47 / 255);
  const mutedGray = rgb(108 / 255, 117 / 255, 125 / 255);
  const charcoal = rgb(33 / 255, 37 / 255, 41 / 255);
  const borderGray = rgb(220 / 255, 225 / 255, 230 / 255);

  const pageWidth = 595.28;
  const pageHeight = 841.89;

  // --- PAGE 1: COVER PAGE ---
  const page1 = pdfDoc.addPage([pageWidth, pageHeight]);

  // Dark header block
  page1.drawRectangle({
    x: 0,
    y: pageHeight - 160,
    width: pageWidth,
    height: 160,
    color: darkNavy,
  });

  page1.drawLine({
    start: { x: 0, y: pageHeight - 160 },
    end: { x: pageWidth, y: pageHeight - 160 },
    thickness: 4,
    color: primaryCyan,
  });

  page1.drawText('IRAN UNIVERSITY OF SCIENCE & TECHNOLOGY  //  MECHANICAL ENGINEERING', {
    x: 50,
    y: pageHeight - 50,
    size: 9,
    font: fontHelveticaBold,
    color: primaryCyan,
  });

  page1.drawText('FLUIDMIND SCIENTIFIC REFERENCE COMPENDIUM', {
    x: 50,
    y: pageHeight - 75,
    size: 16,
    font: fontHelveticaBold,
    color: rgb(1, 1, 1),
  });

  page1.drawText(`OFFICIAL TEXTBOOK & LECTURE REPOSITORY  •  VOL. 2026`, {
    x: 50,
    y: pageHeight - 100,
    size: 10,
    font: fontHelvetica,
    color: rgb(200 / 255, 210 / 255, 225 / 255),
  });

  // Title Box
  page1.drawRectangle({
    x: 50,
    y: pageHeight - 340,
    width: pageWidth - 100,
    height: 150,
    color: rgb(245 / 255, 250 / 255, 255 / 255),
    borderColor: primaryCyan,
    borderWidth: 1.5,
  });

  page1.drawText(book.subject, {
    x: 70,
    y: pageHeight - 225,
    size: 9.5,
    font: fontHelveticaBold,
    color: primaryCyan,
  });

  page1.drawText(book.title, {
    x: 70,
    y: pageHeight - 260,
    size: 15,
    font: fontHelveticaBold,
    color: darkNavy,
  });

  page1.drawText(`Author / Compiler: ${book.author}`, {
    x: 70,
    y: pageHeight - 295,
    size: 11,
    font: fontHelvetica,
    color: charcoal,
  });

  page1.drawText('Curated by: Mohammadamin Sharif (IUST Mechanical Engineering Department)', {
    x: 70,
    y: pageHeight - 320,
    size: 9,
    font: fontHelvetica,
    color: mutedGray,
  });

  // Description Block
  page1.drawText('VOLUME OVERVIEW & ABSTRACT:', {
    x: 50,
    y: pageHeight - 380,
    size: 11,
    font: fontHelveticaBold,
    color: darkNavy,
  });

  const words = book.description.split(' ');
  let line = '';
  let yPos = pageHeight - 405;
  for (const word of words) {
    if ((line + ' ' + word).length > 70) {
      page1.drawText(line, { x: 50, y: yPos, size: 9.5, font: fontHelvetica, color: charcoal });
      line = word;
      yPos -= 16;
    } else {
      line = line ? line + ' ' + word : word;
    }
  }
  if (line) {
    page1.drawText(line, { x: 50, y: yPos, size: 9.5, font: fontHelvetica, color: charcoal });
    yPos -= 25;
  }

  // Engineering Highlights Grid
  page1.drawRectangle({
    x: 50,
    y: 120,
    width: pageWidth - 100,
    height: 180,
    color: rgb(250 / 255, 252 / 255, 255 / 255),
    borderColor: borderGray,
    borderWidth: 1,
  });

  page1.drawText('SYLLABUS & CORE ENGINEERING TOPICS COVERED:', {
    x: 70,
    y: 275,
    size: 10,
    font: fontHelveticaBold,
    color: primaryCyan,
  });

  const bulletPoints = [
    '• Rigorous mathematical derivations & fundamental physical laws',
    '• Complete worked analytical solutions with free-body & control volume diagrams',
    '• Numerical verification & computational correlation (CFD / FEA / MATLAB)',
    '• Practical engineering applications, safety factors, and standard design codes',
    '• Comprehensive reference tables, property charts & dimensional constants',
    '• Formatted for academic study, research references, and professional exam preparation'
  ];

  let bY = 250;
  for (const bp of bulletPoints) {
    page1.drawText(bp, { x: 70, y: bY, size: 9, font: fontHelvetica, color: charcoal });
    bY -= 19;
  }

  // Bottom Footer
  page1.drawLine({
    start: { x: 50, y: 65 },
    end: { x: pageWidth - 50, y: 65 },
    thickness: 1,
    color: borderGray,
  });

  page1.drawText('Moamin.ir / FluidMind  •  Digital Engineering Library  •  Verified Academic Compendium', {
    x: 50,
    y: 50,
    size: 8,
    font: fontHelvetica,
    color: mutedGray,
  });

  // --- PAGE 2: CONTENT & FORMULAS SHEET ---
  const page2 = pdfDoc.addPage([pageWidth, pageHeight]);

  page2.drawText(book.title, {
    x: 50,
    y: pageHeight - 50,
    size: 12,
    font: fontHelveticaBold,
    color: darkNavy,
  });

  page2.drawLine({
    start: { x: 50, y: pageHeight - 60 },
    end: { x: pageWidth - 50, y: pageHeight - 60 },
    thickness: 1.5,
    color: primaryCyan,
  });

  page2.drawText('FUNDAMENTAL EQUATIONS, WORKED METHODOLOGY & NOTES', {
    x: 50,
    y: pageHeight - 85,
    size: 10,
    font: fontHelveticaBold,
    color: primaryCyan,
  });

  const sampleSections = [
    { title: '1. Governing Equations & Control Volume Formulations', text: 'Conservation of mass, linear and angular momentum, and first law energy conservation applied across differential fluid elements and mechanical interfaces.' },
    { title: '2. Boundary Conditions & Interface Dynamics', text: 'Evaluation of kinematic velocity continuity, no-slip wall conditions, thermal heat flux balances, and dynamic shear equilibrium across continuum boundaries.' },
    { title: '3. Dimensionless Numbers & Similitude Criteria', text: 'Reynolds (Re), Mach (Ma), Prandtl (Pr), Nusselt (Nu), and Euler (Eu) scaling analysis ensuring experimental and numerical dynamic similitude.' },
    { title: '4. Computational Verification & Solution Strategy', text: 'Iterative finite volume / finite element procedures, discretization error bounds, convergence criteria, and cross-comparison against empirical benchmarks.' }
  ];

  let secY = pageHeight - 120;
  for (const sec of sampleSections) {
    page2.drawText(sec.title, { x: 50, y: secY, size: 10.5, font: fontHelveticaBold, color: darkNavy });
    secY -= 18;
    page2.drawText(sec.text, { x: 50, y: secY, size: 9, font: fontHelvetica, color: charcoal });
    secY -= 40;
  }

  // Footer on page 2
  page2.drawLine({
    start: { x: 50, y: 50 },
    end: { x: pageWidth - 50, y: 50 },
    thickness: 0.8,
    color: borderGray,
  });
  page2.drawText(`Page 2 of 2  •  ${book.title}  •  IUST Mechanical Engineering`, {
    x: 50,
    y: 35,
    size: 8,
    font: fontHelvetica,
    color: mutedGray,
  });

  const pdfBytes = await pdfDoc.save();
  const dir = path.dirname(book.filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(book.filePath, pdfBytes);
  console.log(`Generated: ${book.filePath} (${pdfBytes.length} bytes)`);
}

async function run() {
  console.log(`Starting generation of ${booksToGenerate.length} book PDFs...`);
  for (const book of booksToGenerate) {
    await createBookPdf(book);
  }
  console.log('All book PDFs successfully generated!');
}

run().catch(err => {
  console.error('PDF generation error:', err);
  process.exit(1);
});
