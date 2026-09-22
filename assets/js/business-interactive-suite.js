/**
 * Comprehensive Interactive Business Management Suite for Engineering Minds
 * ابزارهای تعاملی تکمیلی اصول مدیریت کسب‌وکار (فصل‌های ۳ تا ۹)
 * Author: Mohammadamin Sharif • IUST
 */

(function () {
  'use strict';

  // Helper: Toast Notification
  function showToast(msg) {
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
  window.showGlobalToast = showToast;

  // Helper: Safe clipboard copy
  function copyText(text, successMsg) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        showToast(successMsg);
      }).catch(() => {
        fallbackCopy(text, successMsg);
      });
    } else {
      fallbackCopy(text, successMsg);
    }
  }

  function fallbackCopy(text, successMsg) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    try {
      document.execCommand('copy');
      showToast(successMsg);
    } catch (e) {
      showToast('خطا در کپی متن');
    }
    document.body.removeChild(ta);
  }

  // =========================================================================
  // CHAPTER 3: SWOT ANALYSIS INTERACTIVE TOOL
  // =========================================================================
  const SWOT_DEFAULTS = {
    s: [
      'تسلط به نرم‌افزارهای سالیدورکس و انسیس فلوئنت',
      'تجهیز کارگاه دانشجویی به پرینترهای ۳D و ابزار دقیق',
      'انعطاف‌پذیری بالا در اصلاح طراحی و تحویل سریع نمونه'
    ],
    w: [
      'شناخته‌شده نبودن برند در بازار صنعتی خارج از دانشگاه',
      'سرمایه در گردش و نقدینگی محدود برای تأمین متریال انبوه',
      'تجربه کم در فرآیندهای مالیاتی، قراردادها و بازاریابی B2B'
    ],
    o: [
      'رشد شدید تقاضای شرکت‌های دانش‌بنیان برای قطعات سفارشی',
      'گرانی قطعات وارداتی و گرایش صنایع به تولید داخل و مهندسی معکوس',
      'امکان شرکت در انکوباتورها و رویدادهای جذب سرمایه شتاب‌دهنده‌ها'
    ],
    t: [
      'نوسان قیمت مواد اولیه و فیلامنت‌های تخصصی و آلیاژها',
      'ورود کارگاه‌های سنتی رقیب با ماشین‌آلات سنگین‌تر و صنعتی',
      'طولانی‌شدن دوره وصول مطالبات و تأخیر پرداخت مشتریان دولتی'
    ]
  };

  let swotData = JSON.parse(JSON.stringify(SWOT_DEFAULTS));

  function renderSwotLists() {
    const map = { s: 'swotSList', w: 'swotWList', o: 'swotOList', t: 'swotTList' };
    Object.keys(map).forEach(k => {
      const el = document.getElementById(map[k]);
      if (!el) return;
      el.innerHTML = '';
      swotData[k].forEach((item, idx) => {
        const li = document.createElement('li');
        li.className = 'swot-item';
        li.innerHTML = `
          <span>${item}</span>
          <button class="task-del-btn" title="حذف" onclick="window.removeSwotItem('${k}', ${idx})">✕</button>
        `;
        el.appendChild(li);
      });
    });
  }

  window.addSwotItem = function (type, inputId) {
    const input = document.getElementById(inputId);
    if (!input || !input.value.trim()) return;
    const val = input.value.trim();
    if (swotData[type]) {
      swotData[type].push(val);
      renderSwotLists();
      input.value = '';
      showToast('مورد جدید به تحلیل SWOT افزوده شد');
    }
  };

  window.removeSwotItem = function (type, idx) {
    if (swotData[type]) {
      swotData[type].splice(idx, 1);
      renderSwotLists();
    }
  };

  window.resetSwotDefaults = function () {
    swotData = JSON.parse(JSON.stringify(SWOT_DEFAULTS));
    renderSwotLists();
    showToast('ماتریس SWOT به مقادیر پیش‌فرض بازنشانی شد');
  };

  window.copySwotReport = function () {
    const text = `🧭 تحلیل استراتژیک SWOT (محمدامین شریف - جزوه مدیریت مهندسی)
💪 نقاط قوت (Strengths):
${swotData.s.map(x => '  • ' + x).join('\n')}

⚠️ نقاط ضعف (Weaknesses):
${swotData.w.map(x => '  • ' + x).join('\n')}

🚀 فرصت‌ها (Opportunities):
${swotData.o.map(x => '  • ' + x).join('\n')}

🛡️ تهدیدها (Threats):
${swotData.t.map(x => '  • ' + x).join('\n')}`;
    copyText(text, 'گزارش تحلیل SWOT در کلیپ‌بورد کپی شد');
  };

  // =========================================================================
  // CHAPTER 4: EISENHOWER MATRIX INTERACTIVE TOOL
  // =========================================================================
  const EISEN_DEFAULTS = {
    q1: [
      { text: 'تحویل فوری سفارش قطعه به کارفرما تا عصر امروز', done: false },
      { text: 'تعمیر اضطراری نازل پرینتر کارگاه جهت جلوگیری از توقف خط', done: false }
    ],
    q2: [
      { text: 'طراحی ساختار بوم مدل کسب‌وکار برای محصول جدید', done: false },
      { text: 'آموزش مش‌بندی پیشرفته با نرم‌افزار Ansys به هم‌تیمی‌ها', done: false },
      { text: 'جلسه بازاریابی و شبکه‌سازی در پارک فناوری پردیس', done: false }
    ],
    q3: [
      { text: 'پاسخ به ایمیل‌های اداری عمومی و پیام‌های متفرقه', done: false },
      { text: 'خرید هفتگی اقلام مصرفی و فیلامنت از بازار محلی', done: false }
    ],
    q4: [
      { text: 'چک کردن مداوم اخبار و شبکه‌های اجتماعی در ساعات مفید کاری', done: false },
      { text: 'جلسات بدون دستور جلسه و بحث‌های غیرکاربردی', done: false }
    ]
  };

  let eisenData = JSON.parse(JSON.stringify(EISEN_DEFAULTS));

  function renderEisenLists() {
    const qMap = { q1: 'eisenQ1List', q2: 'eisenQ2List', q3: 'eisenQ3List', q4: 'eisenQ4List' };
    const cMap = { q1: 'eisenQ1Count', q2: 'eisenQ2Count', q3: 'eisenQ3Count', q4: 'eisenQ4Count' };

    Object.keys(qMap).forEach(k => {
      const listEl = document.getElementById(qMap[k]);
      const countEl = document.getElementById(cMap[k]);
      if (!listEl) return;
      if (countEl) countEl.textContent = eisenData[k].length + ' مورد';

      listEl.innerHTML = '';
      eisenData[k].forEach((task, idx) => {
        const li = document.createElement('li');
        li.className = 'task-item';
        li.innerHTML = `
          <div style="display: flex; align-items: center; gap: 8px; flex: 1;">
            <input type="checkbox" ${task.done ? 'checked' : ''} onchange="window.toggleEisenTask('${k}', ${idx})" style="cursor: pointer;">
            <span style="${task.done ? 'text-decoration: line-through; opacity: 0.55;' : ''}">${task.text}</span>
          </div>
          <button class="task-del-btn" title="حذف" onclick="window.removeEisenTask('${k}', ${idx})">✕</button>
        `;
        listEl.appendChild(li);
      });
    });
  }

  window.toggleEisenTask = function (qKey, idx) {
    if (eisenData[qKey] && eisenData[qKey][idx]) {
      eisenData[qKey][idx].done = !eisenData[qKey][idx].done;
      renderEisenLists();
    }
  };

  window.removeEisenTask = function (qKey, idx) {
    if (eisenData[qKey]) {
      eisenData[qKey].splice(idx, 1);
      renderEisenLists();
    }
  };

  window.addEisenTask = function () {
    const input = document.getElementById('eisenNewTaskInput');
    const select = document.getElementById('eisenNewTaskQuad');
    if (!input || !input.value.trim()) return;
    const text = input.value.trim();
    const qKey = select.value || 'q1';
    eisenData[qKey].push({ text, done: false });
    input.value = '';
    renderEisenLists();
    showToast('وظیفه جدید به ماتریس آیزنهاور اضافه شد');
  };

  window.resetEisenDefaults = function () {
    eisenData = JSON.parse(JSON.stringify(EISEN_DEFAULTS));
    renderEisenLists();
    showToast('ماتریس آیزنهاور به حالت اولیه برگشت');
  };

  window.copyEisenReport = function () {
    const formatQ = (list) => list.map(t => `  [${t.done ? '✓' : ' '}] ${t.text}`).join('\n');
    const text = `📋 اولویت‌بندی فعالیت‌ها بر اساس ماتریس آیزنهاور (محمدامین شریف)
🔴 ۱. فوری و مهم (انجام فوری):
${formatQ(eisenData.q1)}

🟢 ۲. غیرفوری اما مهم (برنامه‌ریزی راهبردی):
${formatQ(eisenData.q2)}

🟡 ۳. فوری اما غیرمهم (واگذاری و برون‌سپاری):
${formatQ(eisenData.q3)}

⚪ ۴. غیرفوری و غیرمهم (حذف / کاهش زمان):
${formatQ(eisenData.q4)}`;
    copyText(text, 'گزارش اولویت‌بندی آیزنهاور کپی شد');
  };

  // =========================================================================
  // CHAPTER 5: BCG MATRIX INTERACTIVE TOOL
  // =========================================================================
  const BCG_DEFAULTS = {
    stars: ['خدمات چاپ سه‌بعدی متریال مهندسی (Pey/PEEK)', 'طراحی و ساخت پهپاد نقشه‌برداری اختصاصی'],
    question: ['کیت آموزش رباتیک کودکان و مدارس', 'خدمات پرینت فلزی SLM با برون‌سپاری'],
    cows: ['خدمات تراشکاری و فرزکاری CNC قطعات استاندارد', 'مدل‌سازی سالیدورکس و نقشه‌کشی فریلنس'],
    dogs: ['فروش قالب‌های دست‌دوم قدیمی', 'قطعات ماشین‌کاری سنتی کم‌تیراژ با حاشیه سود منفی']
  };

  let bcgData = JSON.parse(JSON.stringify(BCG_DEFAULTS));

  function renderBcgLists() {
    const map = { stars: 'bcgStarsList', question: 'bcgQuestionList', cows: 'bcgCowsList', dogs: 'bcgDogsList' };
    Object.keys(map).forEach(k => {
      const el = document.getElementById(map[k]);
      if (!el) return;
      el.innerHTML = '';
      bcgData[k].forEach((prod, idx) => {
        const li = document.createElement('li');
        li.className = 'bcg-item';
        li.innerHTML = `
          <span>${prod}</span>
          <button class="task-del-btn" title="حذف" onclick="window.removeBcgProduct('${k}', ${idx})">✕</button>
        `;
        el.appendChild(li);
      });
    });
  }

  window.addBcgProduct = function () {
    const input = document.getElementById('bcgProductInput');
    const select = document.getElementById('bcgCategorySelect');
    if (!input || !input.value.trim()) return;
    const name = input.value.trim();
    const cat = select.value || 'stars';
    bcgData[cat].push(name);
    input.value = '';
    renderBcgLists();
    showToast('محصول جدید به پرتفوی BCG اضافه شد');
  };

  window.removeBcgProduct = function (cat, idx) {
    if (bcgData[cat]) {
      bcgData[cat].splice(idx, 1);
      renderBcgLists();
    }
  };

  window.resetBcgDefaults = function () {
    bcgData = JSON.parse(JSON.stringify(BCG_DEFAULTS));
    renderBcgLists();
    showToast('ماتریس BCG به مقادیر اولیه بازنشانی شد');
  };

  window.copyBcgReport = function () {
    const text = `📊 تحلیل سبد محصولات ماتریس BCG (محمدامین شریف)
⭐ ستاره‌ها (سهم بالا، رشد بالا):
${bcgData.stars.map(x => '  • ' + x).join('\n')}

❓ علامت‌های سؤال (سهم پایین، رشد بالا):
${bcgData.question.map(x => '  • ' + x).join('\n')}

🐄 گاوهای شیرده (سهم بالا، رشد پایین - تأمین مالی):
${bcgData.cows.map(x => '  • ' + x).join('\n')}

🐕 سگ‌ها (سهم پایین، رشد پایین - کاندید حذف):
${bcgData.dogs.map(x => '  • ' + x).join('\n')}`;
    copyText(text, 'گزارش ماتریس BCG در کلیپ‌بورد کپی شد');
  };

  // =========================================================================
  // CHAPTER 6: PORTER'S FIVE FORCES INTERACTIVE TOOL
  // =========================================================================
  const PORTER_PRESETS = {
    printing: {
      f1: 4, f2: 4, f3: 4, f4: 2, f5: 3,
      name: 'کارگاه پرینت سه‌بعدی و نمونه‌سازی سریع'
    },
    epc: {
      f1: 4, f2: 2, f3: 5, f4: 3, f5: 1,
      name: 'پروژه‌های EPC و تجهیزات نیروگاهی و نفت'
    },
    cad: {
      f1: 3, f2: 4, f3: 3, f4: 1, f5: 3,
      name: 'دفتر فنی طراحی CAD و شبیه‌سازی عددی'
    }
  };

  window.updatePorterCalculator = function () {
    const s1 = document.getElementById('porterF1');
    const s2 = document.getElementById('porterF2');
    const s3 = document.getElementById('porterF3');
    const s4 = document.getElementById('porterF4');
    const s5 = document.getElementById('porterF5');
    if (!s1 || !s2 || !s3 || !s4 || !s5) return;

    const v1 = parseInt(s1.value, 10);
    const v2 = parseInt(s2.value, 10);
    const v3 = parseInt(s3.value, 10);
    const v4 = parseInt(s4.value, 10);
    const v5 = parseInt(s5.value, 10);

    const labels = ['', 'خیلی کم (۱)', 'کم (۲)', 'متوسط (۳)', 'شدید (۴)', 'بسیار شدید (۵)'];
    document.getElementById('porterF1Val').textContent = labels[v1];
    document.getElementById('porterF2Val').textContent = labels[v2];
    document.getElementById('porterF3Val').textContent = labels[v3];
    document.getElementById('porterF4Val').textContent = labels[v4];
    document.getElementById('porterF5Val').textContent = labels[v5];

    const total = v1 + v2 + v3 + v4 + v5;
    const scoreEl = document.getElementById('porterTotalScore');
    if (scoreEl) scoreEl.textContent = total;

    const titleEl = document.getElementById('porterVerdictTitle');
    const descEl = document.getElementById('porterVerdictDesc');

    if (total <= 11) {
      if (titleEl) titleEl.textContent = 'صنعت بسیار جذاب و سودآور (فشار رقابتی ضعیف)';
      if (descEl) descEl.textContent = 'موانع ورود بالاست، رقابت ملایم بوده و قدرت چانه‌زنی مشتریان کنترل شده است. حاشیه سود پایدار و بالاست.';
    } else if (total <= 17) {
      if (titleEl) titleEl.textContent = 'فشار رقابتی متوسط (نیازمند تمایز فنی و دقت کیفی)';
      if (descEl) descEl.textContent = 'صنعت سودده است اما موفقیت مستلزم تضمین تلرانس، سرعت تحویل بالا و تمرکز روی یک نیچ‌مارکت مشخص است.';
    } else {
      if (titleEl) titleEl.textContent = 'صنعت پرفشار و رقابت فرسایشی (جنگ قیمتی شدید)';
      if (descEl) descEl.textContent = 'مشتریان و رقبا حاشیه سود را فشرده کرده‌اند. ورود بدون نوآوری رادیکال در کاهش هزینه ساخت توصیه نمی‌شود.';
    }
  };

  window.loadPorterPreset = function (key) {
    const p = PORTER_PRESETS[key];
    if (!p) return;
    document.getElementById('porterF1').value = p.f1;
    document.getElementById('porterF2').value = p.f2;
    document.getElementById('porterF3').value = p.f3;
    document.getElementById('porterF4').value = p.f4;
    document.getElementById('porterF5').value = p.f5;
    window.updatePorterCalculator();
    showToast(`سناریوی «${p.name}» بارگذاری شد`);
  };

  window.copyPorterReport = function () {
    const f1 = document.getElementById('porterF1Val').textContent;
    const f2 = document.getElementById('porterF2Val').textContent;
    const f3 = document.getElementById('porterF3Val').textContent;
    const f4 = document.getElementById('porterF4Val').textContent;
    const f5 = document.getElementById('porterF5Val').textContent;
    const total = document.getElementById('porterTotalScore').textContent;
    const verdict = document.getElementById('porterVerdictTitle').textContent;

    const text = `🛡️ ارزیابی جذابیت صنعت بر اساس ۵ نیروی پورتر (محمدامین شریف)
۱. رقابت رقبای موجود: ${f1}
۲. تهدید تازه‌واردها: ${f2}
۳. قدرت چانه‌زنی خریداران: ${f3}
۴. قدرت چانه‌زنی تأمین‌کنندگان: ${f4}
۵. تهدید خدمات جایگزین: ${f5}
------------------------------------
مجموع شاخص فشار صنعت: ${total} از ۲۵
ارزیابی استراتژیک: ${verdict}`;
    copyText(text, 'گزارش مدل ۵ نیروی پورتر کپی شد');
  };

  // =========================================================================
  // CHAPTER 7: BUSINESS MODEL CANVAS (BMC) INTERACTIVE TOOL
  // =========================================================================
  const BMC_ENGINEERING_PRESET = {
    partners: '• تأمین‌کنندگان فیلامنت صنعتی و آلیاژ آلومینیوم ۶۰۶۱\n• آزمایشگاه‌های متالورژی و تست مکانیکی دانشگاه علم و صنعت\n• شرکت‌های پستی و پیک لجستیک بین‌شهری',
    activities: '• طراحی CAD، مهندسی معکوس و نقشه‌کشی صنعتی\n• پرینت سه‌بعدی دقیق و ماشین‌کاری نهایی CNC\n• کنترل کیفی ابعادی و تضمین تلرانس قطعات',
    resources: '• پرینترهای ۳D رزینی و فیلامنتی ارتقاءیافته\n• ایستگاه کاری مجهز به سالیدورکس و آباکوس\n• دانش فنی تیم مهندسی مکانیک',
    value: '• تولید نمونه اولیه کاربردی در کمتر از ۲۴ ساعت\n• تضمین دقت میکرونی برای اتصالات صنعتی\n• مشاوره فنی رایگان DFM (طراحی برای ساخت)',
    relationships: '• ارتباط مستقیم با مهندس طراح در پیام‌رسان‌ها\n• گزارش تصویری گام به گام مراحل ساخت\n• پشتیبانی فنی و ضمانت تعویض در صورت مغایرت ابعادی',
    channels: '• پورتفولیو و وب‌سایت شخصی مهندسی\n• لینکدین و شبکه‌های تخصصی ساخت و تولید\n• نمایشگاه‌های صنعتی و ارتباط با آزمایشگاه‌های پژوهشی',
    segments: '• استارتاپ‌های رباتیک و سخت‌افزاری نیاز به پروتوتایپ\n• دانشجویان کارشناسی ارشد و پروژه‌های پایان‌نامه\n• کارگاه‌های قالب‌سازی و تولید قطعات یدکی خودرو',
    costs: '• خرید مواد اولیه و رزین‌های مهندسی\n• هزینه استهلاک تجهیزات، نازل و برق صنعتی\n• بازاریابی دیجیتال و تست نمونه‌های تخریبی',
    revenues: '• فروش مستقیم خدمات ساخت قطعه بر حسب ساعت کارکرد و وزن\n• قراردادهای مشاوره‌ای طراحی CAD و شبیه‌سازی جریان\n• برگزاری کارگاه‌های آموزش کاربردی ساخت افزایشی'
  };

  window.loadBmcPreset = function () {
    const map = {
      bmcPartners: BMC_ENGINEERING_PRESET.partners,
      bmcActivities: BMC_ENGINEERING_PRESET.activities,
      bmcResources: BMC_ENGINEERING_PRESET.resources,
      bmcValue: BMC_ENGINEERING_PRESET.value,
      bmcRelationships: BMC_ENGINEERING_PRESET.relationships,
      bmcChannels: BMC_ENGINEERING_PRESET.channels,
      bmcSegments: BMC_ENGINEERING_PRESET.segments,
      bmcCosts: BMC_ENGINEERING_PRESET.costs,
      bmcRevenues: BMC_ENGINEERING_PRESET.revenues
    };
    Object.keys(map).forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = map[id];
    });
    showToast('بوم کسب‌وکار استارتاپ مهندسی مکانیک بارگذاری شد');
  };

  window.clearBmc = function () {
    const ids = ['bmcPartners', 'bmcActivities', 'bmcResources', 'bmcValue', 'bmcRelationships', 'bmcChannels', 'bmcSegments', 'bmcCosts', 'bmcRevenues'];
    ids.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });
    showToast('خانه‌های بوم پاک شدند');
  };

  window.copyBmcReport = function () {
    const val = id => (document.getElementById(id)?.value || '').trim();
    const text = `📋 بوم مدل کسب‌وکار (Business Model Canvas) - محمدامین شریف
--------------------------------------------------
🤝 شرکای کلیدی:
${val('bmcPartners')}

⚙️ فعالیت‌های کلیدی:
${val('bmcActivities')}

🔧 منابع کلیدی:
${val('bmcResources')}

🎁 ارزش پیشنهادی:
${val('bmcValue')}

❤️ ارتباط با مشتریان:
${val('bmcRelationships')}

🚚 کانال‌های توزیع:
${val('bmcChannels')}

👥 بخش‌های مشتریان:
${val('bmcSegments')}

💳 ساختار هزینه‌ها:
${val('bmcCosts')}

💰 جریان‌های درآمدی:
${val('bmcRevenues')}`;
    copyText(text, 'خلاصه بوم مدل کسب‌وکار در کلیپ‌بورد کپی شد');
  };

  // =========================================================================
  // CHAPTER 8: PESTEL MACRO-ENVIRONMENT INTERACTIVE TOOL
  // =========================================================================
  const PESTEL_DEFAULTS = {
    pol: [
      { text: 'سیاست‌های ارزی و مقررات گمرکی واردات ابزار دقیق', impact: 'threat' },
      { text: 'تسهیلات صندوق نوآوری و شکوفایی برای طرح‌های دانش‌بنیان', impact: 'opp' }
    ],
    eco: [
      { text: 'نوسانات نرخ ارز و افزایش بهای مواد اولیه پلیمری و فولادی', impact: 'threat' },
      { text: 'تمایل صنایع سنگین به جایگزینی قطعات خارجی با ساخت داخل', impact: 'opp' }
    ],
    soc: [
      { text: 'گرایش کسب‌وکارها به شخصی‌سازی محصولات در مقیاس خرد', impact: 'opp' },
      { text: 'کمبود نیروی تکنسین ماهر کارگاهی در سنین جوان', impact: 'threat' }
    ],
    tec: [
      { text: 'گسترش نرم‌افزارهای CAD/CAM مجهز به هوش مصنوعی زاینده', impact: 'opp' },
      { text: 'پیشرفت سریع آلیاژهای پلیمری جایگزین فلزات در پرینت سه‌بعدی', impact: 'opp' }
    ],
    env: [
      { text: 'الزامات مدیریت و بازیافت ضایعات پلاستیکی و براده‌های فلزی', impact: 'threat' },
      { text: 'کاهش اتلاف ماده خام در فرآیندهای ساخت افزایشی نسبت به براده‌برداری', impact: 'opp' }
    ],
    leg: [
      { text: 'استانداردهای ایمنی محصول و گواهی‌های ایزو و استاندارد ملی', impact: 'threat' },
      { text: 'ثبت طرح صنعتی و اختراع در سازمان ثبت اسناد برای حفظ مالکیت فکری', impact: 'opp' }
    ]
  };

  let pestelData = JSON.parse(JSON.stringify(PESTEL_DEFAULTS));

  function renderPestelLists() {
    const map = {
      pol: 'pestelPolList', eco: 'pestelEcoList', soc: 'pestelSocList',
      tec: 'pestelTecList', env: 'pestelEnvList', leg: 'pestelLegList'
    };
    Object.keys(map).forEach(k => {
      const el = document.getElementById(map[k]);
      if (!el) return;
      el.innerHTML = '';
      pestelData[k].forEach((item, idx) => {
        const li = document.createElement('li');
        li.className = 'swot-item';
        const isOpp = item.impact === 'opp';
        li.innerHTML = `
          <div style="display: flex; align-items: center; gap: 6px; flex: 1;">
            <span style="font-size: 11px; padding: 2px 6px; border-radius: 4px; font-weight: 800; background: ${isOpp ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}; color: ${isOpp ? '#10b981' : '#f87171'};">
              ${isOpp ? 'فرصت' : 'ریسک'}
            </span>
            <span>${item.text}</span>
          </div>
          <button class="task-del-btn" title="حذف" onclick="window.removePestelItem('${k}', ${idx})">✕</button>
        `;
        el.appendChild(li);
      });
    });
  }

  window.addPestelItem = function (dim, inputId, impactSelectId) {
    const input = document.getElementById(inputId);
    const select = document.getElementById(impactSelectId);
    if (!input || !input.value.trim()) return;
    const text = input.value.trim();
    const impact = select ? select.value : 'opp';
    if (pestelData[dim]) {
      pestelData[dim].push({ text, impact });
      input.value = '';
      renderPestelLists();
      showToast('مورد جدید به تحلیل محیط کلان PESTEL اضافه شد');
    }
  };

  window.removePestelItem = function (dim, idx) {
    if (pestelData[dim]) {
      pestelData[dim].splice(idx, 1);
      renderPestelLists();
    }
  };

  window.resetPestelDefaults = function () {
    pestelData = JSON.parse(JSON.stringify(PESTEL_DEFAULTS));
    renderPestelLists();
    showToast('تحلیل PESTEL به پیش‌فرض مهندسی بازنشانی شد');
  };

  window.copyPestelReport = function () {
    const formatDim = (arr) => arr.map(i => `  [${i.impact === 'opp' ? 'فرصت' : 'ریسک'}] ${i.text}`).join('\n');
    const text = `🌐 تحلیل محیط کلان PESTEL (محمدامین شریف)
🏛️ عوامل سیاسی (Political):
${formatDim(pestelData.pol)}

📈 عوامل اقتصادی (Economic):
${formatDim(pestelData.eco)}

👥 عوامل اجتماعی (Social):
${formatDim(pestelData.soc)}

💻 عوامل فناوری (Technological):
${formatDim(pestelData.tec)}

🌿 عوامل محیط‌زیستی (Environmental):
${formatDim(pestelData.env)}

⚖️ عوامل حقوقی و مقرراتی (Legal):
${formatDim(pestelData.leg)}`;
    copyText(text, 'گزارش تحلیل PESTEL در کلیپ‌بورد کپی شد');
  };

  // =========================================================================
  // CHAPTER 9: GANTT CHART TIMELINE INTERACTIVE TOOL
  // =========================================================================
  const GANTT_DEFAULTS = [
    { name: '۱. تعریف مسئله و استخراج نیازمندی‌های مشتری', start: 1, duration: 2, progress: 100 },
    { name: '۲. مدلسازی سه‌بعدی در سالیدورکس و نقشه‌کشی', start: 2, duration: 3, progress: 85 },
    { name: '۳. شبیه‌سازی عددی و آنالیز المان محدود در انسیز', start: 4, duration: 3, progress: 50 },
    { name: '۴. ساخت نمونه اولیه با پرینتر ۳D و ماشین‌کاری CNC', start: 6, duration: 4, progress: 20 },
    { name: '۵. آزمون تجربی در بستر تست آزمایشگاهی', start: 9, duration: 2, progress: 0 },
    { name: '۶. بازاریابی صنعتی و تحویل تجاری به اولین کارفرما', start: 10, duration: 3, progress: 0 }
  ];

  let ganttTasks = JSON.parse(JSON.stringify(GANTT_DEFAULTS));

  function renderGanttTimeline() {
    const tbody = document.getElementById('ganttTableBody');
    if (!tbody) return;
    tbody.innerHTML = '';

    ganttTasks.forEach((t, idx) => {
      const tr = document.createElement('tr');
      let cells = `<td style="font-weight: 700; white-space: nowrap; padding: 10px 12px;">${t.name}</td>`;

      for (let w = 1; w <= 12; w++) {
        if (w >= t.start && w < t.start + t.duration) {
          if (w === t.start) {
            const span = t.duration;
            cells += `
              <td colspan="${span}" style="padding: 6px 4px; vertical-align: middle;">
                <div class="gantt-timeline-bar">
                  <div class="gantt-progress-fill" style="width: ${t.progress}%;"></div>
                  <span class="gantt-bar-label">${t.progress}%</span>
                </div>
              </td>
            `;
            w += span - 1;
          }
        } else {
          cells += `<td style="text-align: center; color: var(--text-dim); opacity: 0.25; font-size: 11px;">•</td>`;
        }
      }

      cells += `
        <td style="text-align: center; padding: 6px 8px;">
          <button class="task-del-btn" title="حذف فعالیت" onclick="window.removeGanttTask(${idx})">✕</button>
        </td>
      `;
      tr.innerHTML = cells;
      tbody.appendChild(tr);
    });
  }

  window.addGanttTask = function () {
    const nameEl = document.getElementById('ganttTaskName');
    const startEl = document.getElementById('ganttStartWeek');
    const durEl = document.getElementById('ganttDuration');
    const progEl = document.getElementById('ganttProgress');

    if (!nameEl || !nameEl.value.trim()) return;
    const name = nameEl.value.trim();
    const start = Math.max(1, Math.min(12, parseInt(startEl.value, 10) || 1));
    const duration = Math.max(1, Math.min(13 - start, parseInt(durEl.value, 10) || 2));
    const progress = Math.max(0, Math.min(100, parseInt(progEl.value, 10) || 0));

    ganttTasks.push({ name, start, duration, progress });
    nameEl.value = '';
    renderGanttTimeline();
    showToast('فعالیت جدید به جدول گانت اضافه شد');
  };

  window.removeGanttTask = function (idx) {
    ganttTasks.splice(idx, 1);
    renderGanttTimeline();
  };

  window.resetGanttDefaults = function () {
    ganttTasks = JSON.parse(JSON.stringify(GANTT_DEFAULTS));
    renderGanttTimeline();
    showToast('جدول گانت به برنامه پیش‌فرض مهندسی بازنشانی شد');
  };

  window.copyGanttReport = function () {
    const rows = ganttTasks.map(t => `  • ${t.name}: هفته ${t.start} تا ${t.start + t.duration - 1} (${t.progress}% پیشرفت)`).join('\n');
    const text = `📅 جدول زمان‌بندی پروژه (نمودار گانت مهندسی مکانیک - محمدامین شریف):\n${rows}`;
    copyText(text, 'گزارش زمان‌بندی گانت در کلیپ‌بورد کپی شد');
  };

  // =========================================================================
  // INITIALIZATION ON DOM READY
  // =========================================================================
  function initAllSuiteTools() {
    renderSwotLists();
    renderEisenLists();
    renderBcgLists();
    if (document.getElementById('porterF1')) {
      window.updatePorterCalculator();
    }
    renderPestelLists();
    renderGanttTimeline();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAllSuiteTools);
  } else {
    initAllSuiteTools();
  }

})();
