/**
 * Business Management Academy Engine for Engineers
 * دوره جامع مدیریت کسب‌وکار برای مهندسان و ذهن‌های تکنولوژی‌محور
 * Author: Mohammadamin Sharif • IUST & Noshirvani
 */

(function () {
  'use strict';

  // =========================================================================
  // DUAL TRACK SWITCHER (SOLIDWORKS & BUSINESS)
  // =========================================================================
  window.switchAcademyTrack = function (track) {
    const swPane = document.getElementById('academyTrackSolidworksPane');
    const bmPane = document.getElementById('academyTrackBusinessPane');
    const btnBoth = document.getElementById('btnTrackBoth');
    const btnSw = document.getElementById('btnTrackSolidworks');
    const btnBm = document.getElementById('btnTrackBusiness');

    [btnBoth, btnSw, btnBm].forEach(b => { if (b) b.classList.remove('active'); });

    if (track === 'solidworks') {
      if (swPane) swPane.classList.remove('hidden-pane');
      if (bmPane) bmPane.classList.add('hidden-pane');
      if (btnSw) btnSw.classList.add('active');
    } else if (track === 'business') {
      if (swPane) swPane.classList.add('hidden-pane');
      if (bmPane) bmPane.classList.remove('hidden-pane');
      if (btnBm) btnBm.classList.add('active');
      initBusinessWorkbench();
    } else {
      // Both / Panoramic
      if (swPane) swPane.classList.remove('hidden-pane');
      if (bmPane) bmPane.classList.remove('hidden-pane');
      if (btnBoth) btnBoth.classList.add('active');
      initBusinessWorkbench();
    }

    try {
      if (window.lucide && typeof window.lucide.createIcons === 'function') {
        window.lucide.createIcons();
      }
    } catch (e) {}
  };

  // =========================================================================
  // BUSINESS TOOLS WORKBENCH TAB SWITCHER
  // =========================================================================
  window.switchBusinessToolTab = function (toolId, btn) {
    const allBtns = document.querySelectorAll('.bm-tool-tab-btn');
    allBtns.forEach(b => b.classList.remove('active'));
    if (btn) {
      btn.classList.add('active');
    } else {
      allBtns.forEach(b => {
        if (b.getAttribute('onclick') && b.getAttribute('onclick').includes(`'${toolId}'`)) {
          b.classList.add('active');
        }
      });
    }

    const allPanes = document.querySelectorAll('.bm-tool-tab-pane');
    allPanes.forEach(p => p.classList.remove('active'));

    const target = document.getElementById(`bmToolPane_${toolId}`);
    if (target) {
      target.classList.add('active');
    }

    if (toolId === 'pugh') {
      initPughTool();
    } else if (toolId === 'porter') {
      updatePorterAttractiveness();
    } else if (toolId === 'bmc') {
      renderBmcActivePreset();
    }

    try {
      if (window.lucide && typeof window.lucide.createIcons === 'function') {
        window.lucide.createIcons();
      }
    } catch (e) {}
  };

  function initBusinessWorkbench() {
    initPughTool();
    renderBmcActivePreset();
    updatePorterAttractiveness();
    initBusinessQuiz();
  }

  function initPughTool() {
    const workbenchEl = document.getElementById('businessDecisionToolWorkbench');
    if (workbenchEl && typeof window.BusinessDecisionMatrix === 'function') {
      if (!window.activePughMatrix || !workbenchEl.querySelector('.pdm-wrapper')) {
        window.activePughMatrix = new window.BusinessDecisionMatrix('businessDecisionToolWorkbench', 'business');
      }
    }
  }

  // =========================================================================
  // INTERACTIVE BUSINESS MODEL CANVAS (BMC)
  // =========================================================================
  const BMC_PRESETS = {
    cnc: {
      id: 'cnc',
      titleFa: 'کارگاه ساخت و ماشین‌کاری دقیق CNC',
      titleEn: 'Precision CNC Machining Shop',
      partners: [
        'تأمین‌کنندگان آلیاژهای آلومینیوم ۷۰۷۵ و استنلس استیل ۳۱۶',
        'مراکز خدمات عملیات حرارتی، آنودایزینگ و آبکاری',
        'شرکت‌های کالیبراسیون ابزارهای اندازه‌گیری CMM'
      ],
      activities: [
        'برنامه‌نویسی G-Code با مسترکم و سالیدورکس CAM',
        'فرزکاری ۵ محوره قطعات پیچیده پره و توربین',
        'کنترل کیفیت ابعادی میکرومتری و صدور گزارش QC'
      ],
      resources: [
        'دستگاه فرز CNC سه و چهار محوره با اسپیندل ۱۲۰۰۰ RPM',
        'اپراتورها و مهندسان ماشین‌کاری مسلط به GD&T',
        'مجموعه فیکسچرهای صنعتی و ابزارهای سوراخ‌کاری کارباید'
      ],
      value: [
        'تحویل ۴۸ ساعته قطعات دقیق برای نمونه‌سازی‌های فوری',
        'تضمین رواداری ابعادی تا ±۰.۰۱ میلی‌متر و صافی سطح عالی',
        'امکان مشاوره مهندسی معکوس و اصلاح نقشه پیش از براده‌برداری'
      ],
      relations: [
        'پشتیبانی فنی مستقیم با مهندسان طراح کارفرما',
        'قراردادهای پیمانکاری سالانه با تخفیف سفارش حجم بالا',
        'گزارش‌دهی مرحله‌ای پیشرفت ساخت با تصاویر پروسه'
      ],
      channels: [
        'وب‌سایت اختصاصی با قابلیت بارگذاری آنلاین فایل STP/SLDPRT',
        'بازاریابی مستقیم و معرفی حضوری در پارک‌های علم و فناوری',
        'حضور در نمایشگاه‌های بین‌المللی ساخت و تجهیزات نفت و گاز'
      ],
      segments: [
        'شرکت‌های دانش‌بنیان سازنده پهپاد و رباتیک صنعتی',
        'سازندگان پمپ‌ها و کمپرسورهای فرآیندی پالایشگاهی',
        'دفاتر مهندسی نیازمند پروتوتایپ سریع مکانیکی'
      ],
      costs: [
        'هزینه استهلاک دستگاه‌ها و نگهداری دوره‌ای (PM)',
        'خرید ابزار برش (اینسرت‌ها، کولت‌ها، فرز انگشتی)',
        'حقوق مهندسان CAM و تکنسین‌های شیفت تولید'
      ],
      revenue: [
        'درآمد ساعتی ماشین‌کاری CNC (نرخ ساعتی خدمات)',
        'فروش آلیاژ با مارجین تأمین متریال خام',
        'هزینه خدمات مهندسی معکوس و تهیه‌ نقشه‌های ساخت'
      ]
    },
    cfd: {
      id: 'cfd',
      titleFa: 'دفتر مهندسی و تحلیل دینامیک سیالات و توربوماشین',
      titleEn: 'CFD & Turbomachinery Consulting Lab',
      partners: [
        'مراکز پردازش ابری HPC برای حل‌های محاسباتی سنگین',
        'آزمایشگاه‌های تونل باد و فلومتر برای کالیبراسیون نتایج تجربی',
        'اساتید هیئت علمی دانشگاه‌های برتر مکانیک و هوافضا'
      ],
      activities: [
        'تولید شبکه محاسباتی ساختاریافته (Hexahedral Mesh)',
        'شبیه‌سازی جریان‌های آشفته با مدل‌های SST k-omega و LES',
        'بهینه‌سازی آیرودینامیک و کاهش تلفات ثانویه در پره‌ها'
      ],
      resources: [
        'ورک‌استیشن‌های ۶۴ هسته‌ای مجهز به پردازنده‌های محاسباتی',
        'لایسنس‌های نرم‌افزارهای تخصصی ANSYS Fluent / CFX / Star-CCM+',
        'بانک داده تجربی پروژه‌های توربوماشین و ایرفویل‌ها'
      ],
      value: [
        'کاهش ۸۰ درصدی نیاز به ساخت پروتوتایپ‌های گران‌قیمت تجربی',
        'افزایش ۳ تا ۸ درصدی راندمان هیدرولیکی پمپ‌ها و کمپرسورها',
        'ارائه راهکارهای قطعی برای پدیده‌های مخرب کاویتاسیون و استال'
      ],
      relations: [
        'مشاوره‌های فنی هفتگی و جلسات تخصصی انتقال تکنولوژی',
        'گارانتی تطابق نتایج عددی با تلرانس قابل قبول صنعتی',
        'آموزش پرسنل کارفرما برای تحلیل نتایج پس‌پردازش'
      ],
      channels: [
        'انتشار مقالات علمی و کیس‌استادی‌های صنعتی در لینکدین',
        'ارائه وبینارهای تخصصی شبیه‌سازی سیالاتی توربوماشین‌ها',
        'روابط حرفه‌ای شبکه فارغ‌التحصیلان دانشگاه‌های صنعتی'
      ],
      segments: [
        'کارخانجات تولیدکننده توربوپمپ‌ها، فن‌های صنعتی و کمپرسور',
        'شرکت‌های صنایع خودرو و قطعه‌سازان مبدل‌های حرارتی',
        'استارتاپ‌های انرژی‌های تجدیدپذیر (توربین‌های باد و آب)'
      ],
      costs: [
        'هزینه برق، اینترنت اختصاصی و اجاره کلاسترهای محاسباتی',
        'حقوق متخصصان ارشد CFD و تحلیل‌گران دینامیک سیالات',
        'هزینه‌های بازاریابی محتوایی و شرکت در کنفرانس‌های مکانیک'
      ],
      revenue: [
        'قراردادهای پروژه‌ای تحلیل و بهینه‌سازی آیرودینامیکی',
        'مشاوره‌های ساعتی طراحی اولیه ابعادی (Meanline Sizing)',
        'برگزاری کارگاه‌های سازمانی شبیه‌سازی و انتقال دانش فنی'
      ]
    },
    iot: {
      id: 'iot',
      titleFa: 'استارتاپ سنسورهای هوشمند و پایش وضعیت ارتعاشات',
      titleEn: 'IoT Condition Monitoring & Vibration Sensing',
      partners: [
        'سازندگان چیپ‌های سنسوری MEMS و ماژول‌های وایرلس LoRa',
        'شرکت‌های ساخت بردهای چندلایه الکترونیکی (PCB Assembly)',
        'تیم‌های توسعه الگوریتم‌های هوش مصنوعی لبه (Edge AI)'
      ],
      activities: [
        'طراحی بدنه مقاوم صنعتی سنسورها در سالیدورکس (IP68)',
        'کالیبراسیون شتاب‌سنج‌ها روی میز لرزاننده استاندارد',
        'توسعه پلتفرم ابری پردازش داده‌های FFT ارتعاشات ماشین‌آلات'
      ],
      resources: [
        'تیم بین‌رشته‌ای مکانیک، مکاترونیک و هوش مصنوعی',
        'تجهیزات تست ارتعاش، آنالایزر فرکانسی و منبع تغذیه دقیق',
        'پروتکل‌های ارتباطی ضد انفجار ATEX برای محیط‌های گازی'
      ],
      value: [
        'پیش‌بینی خرابی یاتاقان‌ها و شفت‌ها تا ۳ ماه قبل از توقف خط',
        'نصب بی‌سیم و مغناطیسی آسان در کمتر از ۳ دقیقه روی تجهیزات',
        'کاهش هزینه‌های تعمیرات اضطراری تا ۴۵٪ با نگهداری پیش‌بینانه'
      ],
      relations: [
        'داشبورد مانیتورینگ زنده و هشدارهای پیامکی به مدیران کارخانه',
        'تیم پاسخگویی فنی ۲۴ ساعته در شرایط وقوع ارتعاش بحرانی',
        'بروزرسانی مداوم فرم‌ویر سنسورها از طریق اینترنت اشیاء (OTA)'
      ],
      channels: [
        'فروش مستقیم B2B به کارخانجات سیمان، فولاد و نیروگاه‌ها',
        'مشارکت با شرکت‌های اتوماسیون صنعتی و خدمات بازرسی فنی',
        'پایلوت آزمایشی رایگان یک‌ماهه روی تجهیزات کلیدی کارفرما'
      ],
      segments: [
        'مدیران نگهداری و تعمیرات (نت) نیروگاه‌ها و پتروشیمی‌ها',
        'خطوط تولید پیوسته دارویی و صنایع غذایی حساس به توقف',
        'سازندگان تجهیزات دوار سنگین و گیربکس‌های صنعتی'
      ],
      costs: [
        'هزینه تحقیق و توسعه سخت‌افزار و تست‌های استاندارد EMC/EMI',
        'تأمین قطعات الکترونیک و باتری‌های لیتیومی با طول عمر ۵ ساله',
        'هزینه‌های سرور ابری و نگهداری دیتابیس سری‌های زمانی'
      ],
      revenue: [
        'فروش پکیج سخت‌افزاری سنسورها (CapEx)',
        'اشتراک سالانه استفاده از نرم‌افزار آنالیز ارتعاشات (SaaS)',
        'خدمات تخصصی کارشناسی و آنالیز فرکانسی خرابی‌ها'
      ]
    }
  };

  let currentBmcPresetKey = 'cnc';

  window.switchBmcPreset = function (presetKey, btn) {
    if (!BMC_PRESETS[presetKey]) return;
    currentBmcPresetKey = presetKey;

    const allBtns = document.querySelectorAll('.bmc-preset-btn');
    allBtns.forEach(b => b.classList.remove('active'));
    if (btn) {
      btn.classList.add('active');
    } else {
      allBtns.forEach(b => {
        if (b.getAttribute('onclick') && b.getAttribute('onclick').includes(`'${presetKey}'`)) {
          b.classList.add('active');
        }
      });
    }

    renderBmcActivePreset();
    showToast('مدل کسب‌وکار نمونه با موفقیت بارگذاری شد');
  };

  function renderBmcActivePreset() {
    const data = BMC_PRESETS[currentBmcPresetKey];
    if (!data) return;

    const map = {
      bmcPartners: data.partners,
      bmcActivities: data.activities,
      bmcResources: data.resources,
      bmcValue: data.value,
      bmcRelations: data.relations,
      bmcChannels: data.channels,
      bmcSegments: data.segments,
      bmcCosts: data.costs,
      bmcRevenue: data.revenue
    };

    Object.keys(map).forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      el.innerHTML = '';
      map[id].forEach(item => {
        const li = document.createElement('li');
        li.className = 'bmc-box-item';
        li.textContent = item;
        el.appendChild(li);
      });
    });

    const titleEl = document.getElementById('bmcActiveTitle');
    if (titleEl) {
      titleEl.textContent = `${data.titleFa} // ${data.titleEn}`;
    }
  }

  window.copyBmcSummary = function () {
    const data = BMC_PRESETS[currentBmcPresetKey];
    if (!data) return;

    let text = `📋 بوم مدل کسب‌وکار: ${data.titleFa} (${data.titleEn})\nگردآوری و تدوین: مهندس محمدامین شریف\n\n`;
    text += `۱. شرکای کلیدی (Key Partners):\n${data.partners.map(x => `  • ${x}`).join('\n')}\n\n`;
    text += `۲. فعالیت‌های کلیدی (Key Activities):\n${data.activities.map(x => `  • ${x}`).join('\n')}\n\n`;
    text += `۳. ارزش پیشنهادی (Value Proposition):\n${data.value.map(x => `  • ${x}`).join('\n')}\n\n`;
    text += `۴. ارتباط با مشتریان (Customer Relationships):\n${data.relations.map(x => `  • ${x}`).join('\n')}\n\n`;
    text += `۵. بخش‌های مشتریان (Customer Segments):\n${data.segments.map(x => `  • ${x}`).join('\n')}\n\n`;
    text += `۶. منابع کلیدی (Key Resources):\n${data.resources.map(x => `  • ${x}`).join('\n')}\n\n`;
    text += `۷. کانال‌های توزیع (Channels):\n${data.channels.map(x => `  • ${x}`).join('\n')}\n\n`;
    text += `۸. ساختار هزینه‌ها (Cost Structure):\n${data.costs.map(x => `  • ${x}`).join('\n')}\n\n`;
    text += `۹. جریان‌های درآمدی (Revenue Streams):\n${data.revenue.map(x => `  • ${x}`).join('\n')}\n`;

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        showToast('خلاصه بوم مدل کسب‌وکار در کلیپ‌بورد کپی شد');
      }).catch(() => {
        showToast('متن کپی شد');
      });
    } else {
      showToast('متن کپی شد');
    }
  };

  // =========================================================================
  // PORTER 5 FORCES ATTRACTIVENESS CALCULATOR
  // =========================================================================
  window.updatePorterAttractiveness = function () {
    const f1 = parseInt(document.getElementById('porterRange1')?.value || 3, 10);
    const f2 = parseInt(document.getElementById('porterRange2')?.value || 3, 10);
    const f3 = parseInt(document.getElementById('porterRange3')?.value || 3, 10);
    const f4 = parseInt(document.getElementById('porterRange4')?.value || 3, 10);
    const f5 = parseInt(document.getElementById('porterRange5')?.value || 3, 10);

    // Update value labels
    const v1 = document.getElementById('porterVal1'); if (v1) v1.textContent = f1;
    const v2 = document.getElementById('porterVal2'); if (v2) v2.textContent = f2;
    const v3 = document.getElementById('porterVal3'); if (v3) v3.textContent = f3;
    const v4 = document.getElementById('porterVal4'); if (v4) v4.textContent = f4;
    const v5 = document.getElementById('porterVal5'); if (v5) v5.textContent = f5;

    // Intensity of competition = sum of 5 forces (5 to 25)
    const totalIntensity = f1 + f2 + f3 + f4 + f5;
    // Industry Attractiveness = inverse of competitive intensity (Higher intensity = Lower profit attractiveness)
    // Score from 0 to 100%
    const attractivenessPct = Math.round(((25 - totalIntensity) / 20) * 100);

    const scoreMeter = document.getElementById('porterScorePct');
    const scoreBar = document.getElementById('porterScoreBar');
    const verdictEl = document.getElementById('porterVerdict');

    if (scoreMeter) scoreMeter.textContent = `${attractivenessPct}%`;
    if (scoreBar) {
      scoreBar.style.width = `${Math.max(5, Math.min(100, attractivenessPct))}%`;
      if (attractivenessPct >= 65) {
        scoreBar.style.background = 'linear-gradient(90deg, #10b981, #34d399)';
      } else if (attractivenessPct >= 40) {
        scoreBar.style.background = 'linear-gradient(90deg, #0ea5e9, #00f2fe)';
      } else {
        scoreBar.style.background = 'linear-gradient(90deg, #f59e0b, #ef4444)';
      }
    }

    if (verdictEl) {
      if (attractivenessPct >= 65) {
        verdictEl.innerHTML = `<span style="color: #34d399; font-weight: 800;">صنعت با جذابیت بالا و سودآوری مطلوب:</span> فشار رقابتی کنترل‌شده است. حاشیه سود صنعتی مناسب برای ورود شرکت‌های مهندسی با تمرکز بر تمایز و تکنولوژی برتر.`;
      } else if (attractivenessPct >= 40) {
        verdictEl.innerHTML = `<span style="color: #38bdf8; font-weight: 800;">صنعت با جذابیت متعادل و رقابت فشرده:</span> نیازمند تمایز کیفی شفاف، نوآوری در فرآیند تولید و روابط بلندمدت قوی با خریداران صنعتی برای تضمین حاشیه سود.`;
      } else {
        verdictEl.innerHTML = `<span style="color: #f87171; font-weight: 800;">صنعت اقیانوس سرخ با فشار رقابتی بسیار شدید:</span> قدرت چانه‌زنی خریداران یا تأمین‌کنندگان بسیار بالا است. استراتژی مناسب: نوآوری رادیکال، ورود به نیچ‌مارکت‌های ناشناخته، یا کاهش شدید هزینه‌ها.`;
      }
    }
  };

  // =========================================================================
  // INTERACTIVE BUSINESS & STRATEGY QUIZ
  // =========================================================================
  const BUSINESS_QUIZ = [
    {
      q: 'در طراحی صنعتی و مهندسی معکوس، هدف اصلی استفاده از «ماتریس تصمیم‌گیری پوگ (Pugh Matrix)» چیست؟',
      options: [
        'محاسبه تنش‌های حرارتی قطعه با روش المان محدود',
        'مقایسه بدون تعصب کانسپت‌های مختلف بر اساس معیارهای وزنی مشخص',
        'محاسبه قیمت تمام‌شده مواد اولیه برای سفارش خرید',
        'رسم نمودار گانت زمان‌بندی پروژه'
      ],
      correct: 1,
      explanation: 'ماتریس تصمیم‌گیری پوگ یک روش ساختاریافته برای ارزیابی و امتیازدهی به گزینه‌های طراحی در برابر یک معیار مبنا (Baseline) با اعمال وزن اهمیت است که تعصبات ذهنی مهندس را حذف می‌کند.'
    },
    {
      q: 'در ماتریس اولویت‌بندی آیزنهاور، فعالیت‌هایی نظیر «یادگیری نرم‌افزارهای تحلیلی، طراحی فرآیندها و تفکر استراتژیک» در کدام ربع قرار می‌گیرند؟',
      options: [
        'ربع ۱: فوری و مهم (بحران‌ها و آتش‌نشانی کاری)',
        'ربع ۲: غیرفوری اما مهم (رشد کیفی، زیرساخت و پیشگیری)',
        'ربع ۳: فوری اما غیرمهم (وقفه‌ها و کارهای روتین قابل تفویض)',
        'ربع ۴: غیرفوری و غیرمهم (اتلاف وقت)'
      ],
      correct: 1,
      explanation: 'کارهای ربع دوم (مهم ولی غیرفوری) ستون اصلی موفقیت شغلی مهندسان و رهبران هستند. اگر برای ربع ۲ برنامه‌ریزی نکنید، همواره در ربع ۱ دچار بحران‌های اضطراری خواهید بود.'
    },
    {
      q: 'در تحلیل مالی مهندسی، «نقطه سر به سر (Break-even Point)» دقیقاً چه لحظه‌ای را نشان می‌دهد؟',
      options: [
        'لحظه‌ای که محصول به بالاترین سرعت تست دینامیکی برسد',
        'نقطه‌ای که درآمدهای کل دقیقاً با مجموع هزینه‌های ثابت و متغیر برابر شود (سود خالص صفر)',
        'روزی که مالیات سالانه شرکت به اداره مالیات پرداخت شود',
        'زمانی که تمام بدهی‌های بانکی تسویه شده باشد'
      ],
      correct: 1,
      explanation: 'در نقطه سر به سر، درآمدهای حاصل از فروش کل دقیقاً هزینه‌های ثابت (اجاره، استهلاک) و هزینه‌های متغیر (مواد، انرژی) را پوشش می‌دهند؛ پس از این نقطه، هر واحد فروش سود خالص ایجاد می‌کند.'
    },
    {
      q: 'در بوم مدل کسب‌وکار (BMC)، «ارزش پیشنهادی (Value Proposition)» چیست؟',
      options: [
        'مبلغ چک ضمانتی که به کارفرما تحویل داده می‌شود',
        'مجموعه منافع، راهکارهای حل مشکل و تمایزهایی که مشتری را به خرید ترغیب می‌کند',
        'کاتالوگ مشخصات فنی و لیست پیچ‌ها و مهره‌های دستگاه',
        'درصد سودی که سهامداران در پایان سال مالی تقسیم می‌کنند'
      ],
      correct: 1,
      explanation: 'ارزش پیشنهادی پاسخ شفاف به این سوال مشتری است: «چرا باید محصول شما را به جای رقبایتان بخرم؟». این ارزش می‌تواند شامل سرعت تحویل، کاهش هزینه، دقت ابعادی بالاتر یا گارانتی واقعی باشد.'
    },
    {
      q: 'در مدل ۵ نیروی رقابتی مایکل پورتر، ورود شرکت‌های نوظهور با تکنولوژی‌های پرینت سه‌بعدی صنعتی ارزان به بازار قطعه‌سازی، تحت کدام عنوان بررسی می‌شود؟',
      options: [
        'قدرت چانه‌زنی خریداران صنعتی',
        'تهدید ورود رقبای تازه‌وارد و کالاهای جایگزین (New Entrants & Substitutes)',
        'تورم نرخ ارز و متغیرهای کلان اقتصادی',
        'قراردادهای کارگری و تأمین اجتماعی'
      ],
      correct: 1,
      explanation: 'کاهش هزینه‌های راه‌اندازی و ورود ماشین‌آلات ارزان جدید، موانع ورود (Barriers to Entry) به صنعت را پایین آورده و تهدید رقبای تازه‌وارد و تکنولوژی‌های جایگزین را به شدت افزایش می‌دهد.'
    },
    {
      q: 'در مدیریت پروژه‌های مکانیکی و ساخت، تفاوت متدولوژی Waterfall (آبشاری) با Agile (چابک) در چیست؟',
      options: [
        'روش آبشاری نیازی به مدیر پروژه ندارد',
        'روش آبشاری خطی و مرحله‌به‌مرحله است؛ در حالی که چابک بر چرخه‌های تکرارشونده سریع و انعطاف در برابر تغییر استوار است',
        'روش چابک فقط برای طراحی قالب‌های دایکاست استفاده می‌شود',
        'روش آبشاری هزینه‌های پروژه را به صفر می‌رساند'
      ],
      correct: 1,
      explanation: 'پروژه‌های سنگین سخت‌افزاری و تولید انبوه به دلیل هزینه بالای بازطراحی به مدل ساختاریافته آبشاری نیاز دارند، اما طراحی مفهومی، توسعه نمونه اولیه و نرم‌افزار با متدولوژی چابک بسیار سریع‌تر پیش می‌رود.'
    },
    {
      q: 'در ماتریس تحلیل ریسک و FMEA مهندسی، عدد اولویت ریسک (RPN) چگونه محاسبه می‌شود؟',
      options: [
        'مجموع هزینه‌های کل بر مدت زمان ساخت قطعه',
        'حاصل‌ضرب شدت اثر (Severity) × احتمال وقوع (Occurrence) × قابلیت کشف (Detection)',
        'تقسیم تنش تسلیم بر ضریب اطمینان طراحی مکانیکی',
        'میانگین وزنی حقوق مهندسان پروژه'
      ],
      correct: 1,
      explanation: 'فرمول RPN = S × O × D است. عدد حاصل بین ۱ تا ۱۰۰۰ بوده و هر چه بالاتر باشد، اولویت فوری‌تری برای اقدام اصلاحی و پیشگیرانه در خط طراحی و تولید دارد.'
    },
    {
      q: 'از نظر حقوق مالکیت فکری (IP)، مزیت کلیدی نگهداری یک فرمول یا روش تولید به عنوان «اسرار تجاری (Trade Secret)» نسبت به ثبت پتنت چیست؟',
      options: [
        'پتنت هیچ اعتبار قانونی ندارد',
        'اسرار تجاری فاقد انقضای ۲۰ ساله پتنت هستند و نیازی به افشای عمومی جزئیات فنی ندارند',
        'اسرار تجاری به تأییدیه اداره استاندارد نیاز دارند',
        'هزینه ثبت اسرار تجاری همیشه از پتنت بیشتر است'
      ],
      correct: 1,
      explanation: 'پتنت پس از ۲۰ سال منقضی شده و متن کامل روش ساخت در دسترس عموم قرار می‌گیرد. در حالی که اسرار تجاری (مانند فرمول نوشابه کوکاکولا یا الگوریتم‌های خاص ساخت) تا زمانی که فاش نشوند، برای همیشه محافظت می‌شوند.'
    }
  ];

  let currentQuizIdx = 0;
  let quizScore = 0;
  let userAnswers = [];

  function initBusinessQuiz() {
    currentQuizIdx = 0;
    quizScore = 0;
    userAnswers = [];
    renderQuizQuestion();
  }
  window.resetBusinessQuiz = initBusinessQuiz;

  function renderQuizQuestion() {
    const box = document.getElementById('bmQuizContainer');
    if (!box) return;

    if (currentQuizIdx >= BUSINESS_QUIZ.length) {
      renderQuizResults(box);
      return;
    }

    const q = BUSINESS_QUIZ[currentQuizIdx];
    const isAnswered = userAnswers[currentQuizIdx] !== undefined;

    box.innerHTML = `
      <div class="bm-quiz-progress">
        <div class="bm-quiz-counter">
          سوال ${currentQuizIdx + 1} از ${BUSINESS_QUIZ.length}
        </div>
        <div class="bm-quiz-score-tag">
          امتیاز: ${quizScore} / ${currentQuizIdx}
        </div>
      </div>

      <div class="bm-quiz-question">
        ${q.q}
      </div>

      <div class="bm-quiz-options">
        ${q.options.map((opt, idx) => {
          let btnClass = 'bm-quiz-option';
          let disabled = isAnswered ? 'disabled' : '';
          if (isAnswered) {
            if (idx === q.correct) btnClass += ' correct';
            else if (idx === userAnswers[currentQuizIdx]) btnClass += ' incorrect';
          }
          return `
            <button class="${btnClass}" onclick="window.selectQuizOption(${idx})" ${disabled}>
              <span style="font-family: 'Fira Code', monospace; font-weight: bold; width: 20px; display: inline-block;">${['الف', 'ب', 'ج', 'د'][idx]}-</span>
              <span>${opt}</span>
            </button>
          `;
        }).join('')}
      </div>

      <div class="bm-quiz-feedback ${isAnswered ? 'visible' : ''}">
        <div class="bm-quiz-feedback-title">
          ${userAnswers[currentQuizIdx] === q.correct ? '✓ پاسخ صحیح است!' : '✕ پاسخ نادرست! گزینه صحیح مشخص شد.'}
        </div>
        <div class="bm-quiz-feedback-desc">
          ${q.explanation}
        </div>
      </div>

      ${isAnswered ? `
        <div class="bm-quiz-nav">
          <button class="bm-btn-primary" onclick="window.nextQuizQuestion()">
            ${currentQuizIdx + 1 === BUSINESS_QUIZ.length ? 'مشاهده کارنامه نهایی آزمون' : 'سوال بعدی ←'}
          </button>
        </div>
      ` : ''}
    `;

    try {
      if (window.lucide && typeof window.lucide.createIcons === 'function') {
        window.lucide.createIcons();
      }
    } catch (e) {}
  }

  window.selectQuizOption = function (optIdx) {
    if (userAnswers[currentQuizIdx] !== undefined) return;
    userAnswers[currentQuizIdx] = optIdx;
    if (optIdx === BUSINESS_QUIZ[currentQuizIdx].correct) {
      quizScore++;
    }
    renderQuizQuestion();
  };

  window.nextQuizQuestion = function () {
    currentQuizIdx++;
    renderQuizQuestion();
  };

  function renderQuizResults(box) {
    const pct = Math.round((quizScore / BUSINESS_QUIZ.length) * 100);
    let title = '';
    let badge = '';
    let desc = '';

    if (pct >= 85) {
      title = 'عالی! شایستگی مدیریت ارشد مهندسی (Executive Engineering Mind)';
      badge = 'رتبه ممتاز • مدیر استراتژیست';
      desc = 'شما درک عمیق و یکپارچه‌ای از ترکیب تفکر فنی، مدل‌های کسب‌وکار، تحلیل ریسک و استراتژی‌های صنعتی دارید.';
    } else if (pct >= 60) {
      title = 'بسیار خوب! هوش تجاری و تصمیم‌گیری قوی (Industrial Project Leader)';
      badge = 'رتبه قابل قبول • مدیر پروژه';
      desc = 'پایه‌های تصمیم‌گیری و مدیریت زمان در شما مستحکم است. مرور فصل‌های بوم کسب‌وکار و مدل‌های مالی پیشنهاد می‌شود.';
    } else {
      title = 'پایه فنی خوب؛ نیاز به تقویت نگرش کسب‌وکار (Engineering Specialist)';
      badge = 'مهندس طراح • نیازمند توسعه مدیریت';
      desc = 'تمرکز زیادی بر حل مسئله فنی دارید اما موفقیت تجاری نیازمند درک بهتر هزینه، رقابت و ارزش پیشنهادی مشتری است.';
    }

    box.innerHTML = `
      <div style="text-align: center; padding: 20px 10px;">
        <div style="display: inline-flex; align-items: center; justify-content: center; width: 80px; height: 80px; border-radius: 50%; background: rgba(20, 184, 166, 0.2); border: 2px solid #2dd4bf; margin-bottom: 16px; font-size: 26px; font-family: 'Fira Code', monospace; color: #2dd4bf; font-weight: 800;">
          ${pct}%
        </div>
        <div style="font-size: 11px; font-family: 'Fira Code', monospace; color: #00f2fe; margin-bottom: 8px;">
          [${badge}]
        </div>
        <h3 style="font-size: 18px; font-weight: 800; color: #f8fafc; margin-bottom: 12px;">
          ${title}
        </h3>
        <p style="font-size: 13px; color: #94a3b8; max-width: 580px; margin: 0 auto 24px auto; line-height: 1.7;">
          ${desc}
        </p>

        <div style="display: flex; justify-content: center; gap: 12px; flex-wrap: wrap;">
          <button class="bm-btn-primary" onclick="window.resetBusinessQuiz()">
            <i data-lucide="rotate-ccw" style="width: 14px; height: 14px;"></i>
            تکرار مجدد آزمون
          </button>
          <a href="books/business-management-for-engineers.html" class="bm-btn-secondary">
            <i data-lucide="book-open" style="width: 14px; height: 14px;"></i>
            مطالعه جزوه کامل اصول مدیریت
          </a>
        </div>
      </div>
    `;

    try {
      if (window.lucide && typeof window.lucide.createIcons === 'function') {
        window.lucide.createIcons();
      }
    } catch (e) {}
  }

  // Toast feedback helper
  function showToast(msg) {
    if (typeof window.showGlobalToast === 'function') {
      window.showGlobalToast(msg);
      return;
    }
    let toast = document.getElementById('globalToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'globalToast';
      toast.className = 'pdm-toast';
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.classList.add('visible');
    setTimeout(() => {
      toast.classList.remove('visible');
    }, 2400);
  }

  // Auto initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initBusinessWorkbench();
    });
  } else {
    initBusinessWorkbench();
  }

})();
