/**
 * SolidWorks Engineering Academy & Blueprint Lab
 * دوره جامع آموزش تخصصی مهندسی سالیدورکس - گردآوری، تدوین و تنظیم: محمدامین شریف
 */

window.solidworksAcademyData = {
  chapters: [
    {
      id: 'ch1',
      num: 'فصل ۰۱',
      numEn: 'CH 01',
      title: 'محیط طراحی دو بعدی (2D Sketching)',
      titleEn: '2D Sketching Environment',
      icon: 'pen-tool',
      badge: 'محیط ترسیم دو بعدی Sketch',
      summary: 'مراحل ورود به محیط طراحی، انتخاب صفحه، تنظیم استانداردهای یکا و اندازه‌گذاری، و جعبه‌ابزار کامل ترسیمات دوبعدی.',
      summaryEn: 'Entry workflow, plane selection, drafting standards, units setup, and complete 2D sketch toolset.',
      content: {
        intro: `
          <div class="sw-callout sw-callout-success">
            <i data-lucide="check-circle" class="sw-callout-icon"></i>
            <div class="sw-callout-content">
              <div class="sw-callout-title" data-en="Entry Procedure into 2D Sketching" data-fa="طریقه ورود به محیط طراحی دو بعدی">طریقه ورود به محیط طراحی دو بعدی</div>
              <div data-en="1. From the top File menu click New (or press Ctrl + N) &bull; 2. Select the 'Part' 3D environment &bull; 3. From CommandManager click the Sketch tab &bull; 4. Select one of the coordinate planes (Front Plane, Top Plane, or Right Plane) and click the Sketch icon to enter the 2D sketcher." data-fa="۱. پس از اجرای برنامه از نوار بالای صفحه شاخه File را باز کرده و بر روی آیکون New کلیک کنید (و یا با فشردن کلیدهای Ctrl + N).<br>۲. با انتخاب محیط Part وارد محیط سه‌بعدی شده و از قسمت مدیریت فرمان (CommandManager) بر روی نوار ابزار Sketch کلیک کنید.<br>۳. با انتخاب یکی از صفحات مختصاتی (Front Plane، Top Plane یا Right Plane) و کلیک بر روی ابزار Sketch وارد این محیط شوید.">
                ۱. پس از اجرای برنامه از نوار بالای صفحه شاخه File را باز کرده و بر روی آیکون New کلیک کنید (یا فشردن Ctrl + N).<br>
                ۲. با انتخاب محیط Part وارد شده و از نوار ابزار CommandManager تب Sketch را باز کنید.<br>
                ۳. با انتخاب یکی از صفحات سه‌گانه و کلیک روی Sketch وارد محیط طراحی دو بعدی شوید.
              </div>
            </div>
          </div>

          <div class="sw-callout">
            <i data-lucide="settings" class="sw-callout-icon"></i>
            <div class="sw-callout-content">
              <div class="sw-callout-title" data-en="Step 1: Setting Drafting Standards & Units" data-fa="اولین گام: تعریف استاندارد اندازه‌گذاری و سیستم یکاها">اولین گام: تعریف استاندارد اندازه‌گذاری و سیستم یکاها</div>
              <div data-en="Navigate to Tools -> Options -> Document Properties. Under 'Drafting Standard', choose ISO or ANSI. In the 'Units' section, configure the unit system: MMGS (millimeter, gram, second), CGS (centimeter, gram, second), MKS (meter, kilogram, second), or IPS (inch, pound, second)." data-fa="مسیر دسترسی: <code>Tools -> Options -> Document Properties</code><br>در سربرگ Drafting Standard استاندارد نقشه‌کشی (ISO یا ANSI) را مشخص کنید. در بخش Units سیستم یکاهای مهندسی را انتخاب نمایید (سیستم استاندارد ایران و مهندسی مکانیک: MMGS شامل میلی‌متر، گرم و ثانیه).">
                مسیر دسترسی: <code>Tools -> Options -> Document Properties</code><br>
                در سربرگ Drafting Standard استاندارد (ISO یا ANSI) و در بخش Units سیستم یکاهای مهندسی (MMGS شامل میلی‌متر، گرم و ثانیه) را تعیین کنید.
              </div>
            </div>
          </div>
        `,
        tools: [
          { name: 'Line', fa: 'رسم خط مستقیم', icon: 'minus', desc: 'ترسیم پاره‌خط‌های پیوسته مستقیم بین نقاط.', descEn: 'Draws straight continuous line segments.' },
          { name: 'Centerline', fa: 'خط محور و کمکی', icon: 'git-commit', desc: 'ترسیم خط‌چین محور تقارن، دوران و خطوط کمکی جهت قیدگذاری بدون تاثیر در حجم سه‌بعدی.', descEn: 'Draws dashed construction lines for rotation axes, symmetry, and references.' },
          { name: 'Corner Rectangle', fa: 'مستطیل با دو رأس مقابل', icon: 'square', desc: 'ترسیم مستطیل با کلیک روی دو نقطه گوشه مقابل.', descEn: 'Draws rectangle defined by two opposite corner points.' },
          { name: 'Center Rectangle', fa: 'مستطیل با نقطه مرکزی', icon: 'maximize', desc: 'ترسیم مستطیل با تعریف نقطه مرکز و یک راس؛ ایده‌آل برای قطعات متقارن حول مبدا.', descEn: 'Draws rectangle from center point outward, maintaining symmetry.' },
          { name: '3-Point Center Rectangle', fa: 'مستطیل با سه نقطه و مرکز', icon: 'box', desc: 'ترسیم مستطیل زاویه‌دار با تعریف مرکز، راستای طول و عرض.', descEn: 'Draws angled rectangle by defining center, length vector, and width.' },
          { name: 'Parallelogram', fa: 'متوازی‌الأضلاع سه نقطه‌ای', icon: 'trello', desc: 'ترسیم متوازی‌الأضلاع با تعریف سه نقطه بر روی رئوس برای ترسیم وجوه شیب‌دار.', descEn: 'Draws parallelogram by defining three vertices.' },
          { name: 'Straight Slot', fa: 'سوراخ کشویی مستقیم (لوبیا)', icon: 'toggle-left', desc: 'ایجاد شیار لوبیایی شکل با تعریف فاصله دو مرکز و شعاع.', descEn: 'Draws linear slot with two center points and radius.' },
          { name: 'Centerpoint Straight Slot', fa: 'سوراخ کشویی با مرکز و رأس', icon: 'toggle-right', desc: 'ایجاد شیار لوبیایی متقارن از مرکز به بیرون.', descEn: 'Draws symmetric slot radiating from center point.' },
          { name: 'Center Point Arc Slot', fa: 'سوراخ کشویی سیلندری کمانی', icon: 'disc', desc: 'ایجاد شیار هلالی دوار حول مرکز برای رگلاژ زاویه‌ای قطعات.', descEn: 'Draws circular arc slot for angular adjustment mechanisms.' },
          { name: 'Circle', fa: 'رسم دایره با مرکز و شعاع', icon: 'circle', desc: 'ترسیم دایره با کلیک در مرکز و درگ کردن تا شعاع مورد نظر.', descEn: 'Draws circle defined by center point and perimeter radius.' },
          { name: 'Perimeter Circle', fa: 'ترسیم دایره محیطی ۳ نقطه‌ای', icon: 'help-circle', desc: 'ترسیم دایره گذرنده از سه نقطه محیطی یا مماس بر سه خط.', descEn: 'Draws circle passing through three defined perimeter points.' },
          { name: 'Center Point Arc', fa: 'کمان با نقطه مرکز', icon: 'compass', desc: 'ترسیم کمان با تعیین مرکز دایره، نقطه شروع و زاویه انتهای کمان.', descEn: 'Draws arc by defining center point, start, and end points.' },
          { name: 'Tangent Arc', fa: 'کمان مماسی پیوسته', icon: 'trending-up', desc: 'ایجاد کمان مماس بر انتهای یک خط یا منحنی دیگر با انحنای نرم.', descEn: 'Draws tangent arc continuous from the endpoint of existing geometry.' },
          { name: '3-Point Arc', fa: 'کمان محیطی سه نقطه‌ای', icon: 'corner-down-right', desc: 'ترسیم کمان با تعریف نقطه شروع، نقطه پایان و نقطه کمان روی محیط.', descEn: 'Draws arc passing through start, end, and middle curvature points.' },
          { name: 'Polygon', fa: 'رسم چندضلعی منتظم', icon: 'hexagon', desc: 'ترسیم ۳ تا ۴۰ ضلعی منتظم محاطی یا محیطی حول دایره کمکی.', descEn: 'Draws inscribed or circumscribed regular polygons (3 to 40 sides).' },
          { name: 'Spline', fa: 'رسم منحنی نرم آزاد', icon: 'activity', desc: 'ترسیم منحنی پیوسته فرم آزاد با دسته‌های کنترل بردار شیب و مماس.', descEn: 'Draws smooth B-spline curves with handle vector control.' },
          { name: 'Equation Driven Curve', fa: 'رسم منحنی با معادله ریاضی', icon: 'code', desc: 'ترسیم دقیق منحنی‌های تحلیلی با فرمول‌های صریح ریاضی y=f(x) یا پارامتریک x(t), y(t).', descEn: 'Draws mathematical curves using explicit or parametric equations.' },
          { name: 'Fit Spline', fa: 'منحنی اتصال‌دهنده یکپارچه', icon: 'share-2', desc: 'ترکیب و ادغام چند خط و کمان گسسته به یک منحنی اسپیلاین پیوسته.', descEn: 'Combines multiple contiguous lines/arcs into a single smooth spline.' },
          { name: 'Ellipse', fa: 'ترسیم بیضی مهندسی', icon: 'circle-slash', desc: 'ترسیم بیضی با تعریف مرکز، قطر بزرگ و قطر کوچک.', descEn: 'Draws ellipse defined by center and major/minor axes.' },
          { name: 'Trim Entities', fa: 'ویرایشگر هوشمند برش (تریم)', icon: 'scissors', desc: 'برش و حذف خطوط اضافه با روش‌های Power Trim، Corner، Trim Away و Trim to Closest.', descEn: 'Trims excess sketch geometry using Power Trim or Corner methods.' },
          { name: 'Extend Entities', fa: 'ترمیم‌کننده و امتداددهنده', icon: 'arrow-up-right', desc: 'امتداد دادن خط یا کمان تا رسیدن به اولین مرز یا خط متقاطع بعدی.', descEn: 'Extends sketch segments to intersect adjacent geometry.' },
          { name: 'Offset Entities', fa: 'تغییر مقیاس و آفست موازی', icon: 'copy', desc: 'ایجاد ترسیم موازی با فاصله معین در یک جهت، دو طرف (Bi-directional) یا با درپوش کمانی/خطی.', descEn: 'Offsets sketch curves at specified parallel distances.' },
          { name: 'Mirror Entities', fa: 'قرینه‌ساز نسبت به محور', icon: 'columns', desc: 'قرینه‌سازی المان‌های انتخابی نسبت به یک خط‌چین محور تقارن (Centerline).', descEn: 'Mirrors sketch entities symmetrically across a centerline axis.' },
          { name: 'Linear Sketch Pattern', fa: 'تکثیر خطی در ۲ جهت', icon: 'grid', desc: 'تکثیر المان‌ها در امتداد محور X و Y با تعیین فاصله و تعداد نسخه.', descEn: 'Patterns entities along linear directional axes with spacing and instance count.' },
          { name: 'Circular Sketch Pattern', fa: 'تکثیر دایروی حول مرکز', icon: 'rotate-cw', desc: 'تکثیر شعاعی دور یک نقطه یا دایره با زاویه دلخواه یا برابر (Equal Spacing).', descEn: 'Patterns entities radially around a center point with equal spacing.' },
          { name: 'Move / Copy / Rotate / Scale', fa: 'جابجایی، کپی، دوران و مقیاس', icon: 'move', desc: 'ابزارهای ترنسفورم هندسی برای تغییر موقعیت، چرخش زاویه‌ای یا تغییر ابعاد.', descEn: 'Transformation tools for translating, rotating, duplicating, and scaling sketches.' },
          { name: 'Sketch Fillet / Chamfer', fa: 'گرد کردن (اِر) و پخ زدن گوشه', icon: 'corner-down-left', desc: 'گرد کردن گوشه‌ها با شعاع R یا پخ زدن با فاصله و زاویه در محیط دو بعدی.', descEn: 'Applies fillets (radius R) and chamfers (angle/distance) to sketch corners.' }
        ],
        warning: `
          <div class="sw-callout sw-callout-warning">
            <i data-lucide="alert-triangle" class="sw-callout-icon"></i>
            <div class="sw-callout-content">
              <div class="sw-callout-title" data-en="Critical Note: Exiting the 2D Sketch" data-fa="نکته بسیار مهم: خروج اصولی از محیط دو بعدی">نکته بسیار مهم: خروج اصولی از محیط دو بعدی</div>
              <div data-en="To save and exit the sketch, use the 'Exit Sketch' icon at the top toolbar or the confirmation corner icon (top right of graphic area). WARNING: Clicking the RED CROSS (Discard changes) will delete all your sketch geometry in that sketch and exit without saving!" data-fa="برای خروج و تایید اسکچ از آیکون Exit Sketch در نوار ابزار و یا آیکون گوشه بالا سمت راست استفاده کنید.<br><strong>هشدار:</strong> کلیک بر روی علامت ضربدر قرمز در بالای صفحه، کلیه ترسیمات شما را در آن Sketch پاک کرده و بدون ذخیره از محیط خارج می‌شود!">
                برای خروج از اسکچ از آیکون <strong>Exit Sketch</strong> در گوشه بالا سمت راست استفاده کنید.<br>
                <strong>هشدار:</strong> علامت ضربدر قرمز کلیه ترسیمات شما را در همان Sketch پاک کرده و بدون ذخیره خارج می‌شود!
              </div>
            </div>
          </div>
        `
      }
    },
    {
      id: 'ch2',
      num: 'فصل ۰۲',
      numEn: 'CH 02',
      title: 'قیود هندسی و مفهوم طرح کاملاً مقید (Fully Defined)',
      titleEn: 'Geometric Relations & Fully Defined Status',
      icon: 'link-2',
      badge: 'قیود هندسی و درجات آزادی',
      summary: 'ابزار Smart Dimension، درجات آزادی، کدهای رنگی ترسیمات در سالیدورکس، و فهرست کامل قیود هندسی Add Relations.',
      summaryEn: 'Smart Dimension, degrees of freedom, sketch color coding matrix, and complete Add Relations list.',
      content: {
        intro: `
          <div class="sw-callout">
            <i data-lucide="maximize-2" class="sw-callout-icon"></i>
            <div class="sw-callout-content">
              <div class="sw-callout-title" data-en="Smart Dimension & Fully Definition" data-fa="ابزار اندازه گذاری Smart Dimension و مفهوم فولی شدن">ابزار اندازه گذاری Smart Dimension و مفهوم فولی شدن</div>
              <div data-en="Whenever a sketch geometry is fully constrained such that all dimensions, lengths, and their relative distances to the origin coordinate system are completely locked, it is termed 'Fully Defined'. In SolidWorks, fully defined sketches turn pitch black." data-fa="هرگاه بر روی شکل ترسیم شده به طور کامل قیدگذاری شود، به نحوی که اندازه همه اضلاع و فاصله آن‌ها با محور مختصات (Origin) مشخص باشد، به آن شکل «فولی» (Fully Defined) گویند که نرم‌افزار آن شکل ترسیم شده را به رنگ مشکی نشان می‌دهد.">
                هرگاه بر روی شکل ترسیم شده به طور کامل قیدگذاری شود، به نحوی که اندازه همه اضلاع و فاصله آن‌ها با محور مختصات مشخص باشد، به آن شکل «فولی» گویند که نرم‌افزار آن شکل ترسیم شده را به رنگ <strong>مشکی</strong> نشان می‌دهد.
              </div>
            </div>
          </div>
        `,
        colorMatrix: [
          { color: 'blue', en: 'Blue (Under Defined)', fa: 'آبی: تعریف نشده (جاری)', desc: 'ترسیماتی که به اندازه کافی قیدگذاری یا اندازه‌گذاری نشده‌اند و درجات آزادی دارند. با کشیدن ماوس تغییر موقعیت یا اندازه می‌دهند.' },
          { color: 'black', en: 'Black (Fully Defined)', fa: 'مشکی: کاملاً مقید و پایدار', desc: 'تمامی المان‌ها نسبت به مبدا مختصات مهار شده‌اند. شکل صلب و غیرقابل تغییر تصادفی است (وضعیت مطلوب مهندسی).' },
          { color: 'yellow', en: 'Yellow (Over Defined)', fa: 'زرد: دارای قید یا اندازه تکراری', desc: 'حداقل دو قید یا اندازه یک ویژگی هندسی را به صورت اضافه تعریف می‌کنند. برای رفع باید قید یا اندازه تکراری پاک شود.' },
          { color: 'red', en: 'Red (Conflict / Unsolvable)', fa: 'قرمز: دارای خطا و قیود متناقض', desc: 'قیود داده شده از نظر ریاضی غیرقابل حل هستند (مانند عمود بودن دو خط موازی). نیاز به اصلاح فوری دارد.' }
        ],
        relations: [
          { name: 'Coincident', fa: 'انطباق نقطه و خط', desc: 'منطبق کردن دو نقطه بر یکدیگر یا قرار دادن نقطه روی امتداد یک خط یا منحنی.' },
          { name: 'Merge', fa: 'چسباندن و ادغام', desc: 'ادغام دو نقطه آزاد در یک نقطه مشترک واحد.' },
          { name: 'Concentric', fa: 'هم‌مرکز بودن', desc: 'هم‌مرکز کردن دو یا چند دایره، کمان یا استوانه.' },
          { name: 'Tangent', fa: 'قید مماسی', desc: 'مماس کردن خط با کمان یا مماس کردن دو منحنی در نقطه اتصال بدون زاویه شکست.' },
          { name: 'Perpendicular', fa: 'تعامد (قائم)', desc: 'عمود کردن دو پاره‌خط بر یکدیگر با زاویه ۹۰ درجه.' },
          { name: 'Parallel', fa: 'موازی‌سازی', desc: 'موازی کردن دو خط در صفحه ترسیم.' },
          { name: 'Horizontal', fa: 'افقی کردن', desc: 'افقی کردن خط یا هم‌تراز کردن افقی دو نقطه مجزا نسبت به محور X.' },
          { name: 'Vertical', fa: 'عمودی کردن', desc: 'عمودی کردن خط یا هم‌تراز کردن عمودی دو نقطه مجزا نسبت به محور Y.' },
          { name: 'Fix', fa: 'قفل و تثبیت در فضا', desc: 'ثابت کردن نقطه یا خط در مختصات جاری خود و سلب درجات آزادی.' },
          { name: 'Coradial', fa: 'هم‌مرکزی و انطباق کمان', desc: 'هم‌مرکز بودن و هم‌شعاع بودن همزمان دو کمان به گونه‌ای که روی یک دایره واحد قرار گیرند.' },
          { name: 'For Construction', fa: 'تبدیل به خط کمکی', desc: 'تغییر نوع عناصر ساختاری به غیرساختاری (خط‌چین) جهت استفاده به عنوان مراجع قیدگذاری.' },
          { name: 'Symmetric', fa: 'تقارن متقارن', desc: 'ایجاد تقارن دقیق بین دو المان نسبت به یک خط‌چین محور تقارن (Centerline).' },
          { name: 'Collinear', fa: 'هم‌راستا سازی', desc: 'قرار دادن دو یا چند پاره‌خط در یک راستای امتدادی مستقیم.' },
          { name: 'Midpoint', fa: 'قید نقطه میانی', desc: 'قرار دادن یک نقطه روی مرکز دقیق و وسط یک پاره‌خط.' }
        ],
        proTip: `
          <div class="sw-callout sw-callout-success">
            <i data-lucide="zap" class="sw-callout-icon"></i>
            <div class="sw-callout-content">
              <div class="sw-callout-title" data-en="Multi-Select Shortcut (Ctrl Key)" data-fa="تکنیک کلیدی قیدگذاری چند المان با کلید Ctrl">تکنیک کلیدی قیدگذاری چند المان با کلید Ctrl</div>
              <div data-en="To apply geometric relations between two or more sketch entities, hold down the CTRL key on your keyboard before selecting the items. The PropertyManager window will instantly open with eligible 'Add Relations' buttons." data-fa="<strong>نکته کلیدی:</strong> برای قیدگذاری بین چند موضوع، می‌بایست کلید <strong>Ctrl</strong> کیبورد را قبل از انتخاب ترسیمات نگه داشته، موضوعات را انتخاب کرده و سپس قید مورد نظر را از پنجره Add Relations اعمال کنیم.">
                <strong>نکته کلیدی:</strong> برای قیدگذاری بین چند موضوع می‌بایست کلید <strong>Ctrl</strong> کیبورد را قبل از انتخاب ترسیمات نگه داشته و سپس قید مورد نظر را اعمال کنیم.
              </div>
            </div>
          </div>
        `
      }
    },
    {
      id: 'ch3',
      num: 'فصل ۰۳',
      numEn: 'CH 03',
      title: 'تنظیمات سیستمی، جعبه ابزار View و کلیدهای میانبر',
      titleEn: 'System Options, View Toolbar & Shortcut Matrix',
      icon: 'sliders',
      badge: 'کنترل دید و ماتریس میانبرها',
      summary: 'پنجره تنظیمات Options، ابزار Snap/Grid، جعبه ابزار کنترل دید View، سفارشی‌سازی Customize و جدول کامل کلیدهای میانبر استاندارد.',
      summaryEn: 'Options dialog architecture, Snap/Grid activation, View HUD toolbar, Customize window, and standard keyboard shortcut cheatsheet.',
      content: {
        intro: `
          <div class="sw-callout">
            <i data-lucide="layout" class="sw-callout-icon"></i>
            <div class="sw-callout-content">
              <div class="sw-callout-title" data-en="Options Window & Grid Snap" data-fa="پنجره تنظیمات Options و ابزار شبکه بندی Grid/Snap">پنجره تنظیمات Options و ابزار شبکه بندی Grid/Snap</div>
              <div data-en="Activate grid snaps via Tools -> Options -> Document Properties -> Grid/Snap -> Display Grid. The Options dialog features a tree browser on the left with System Options (global software settings) and Document Properties (part/drawing specific settings), plus a Reset button to restore defaults." data-fa="برای فعال‌کردن شبکه‌بندی علاوه بر ابزار Grid/Snap می‌توانید از مسیر <code>Tools -> Options -> Document Properties -> Grid/Snap</code> وارد شده و با انتخاب Display Grid شبکه‌بندی را فعال کنید.<br>پنجره تنظیمات (Options) شامل دو سربرگ <strong>System Options</strong> (تنظیمات ویژگی‌های نرم‌افزار) و <strong>Document Properties</strong> (تنظیمات محیط فایل طراحی) می‌باشد. دکمه Reset تمام تغییرات را به تنظیمات کارخانه بازمی‌گرداند.">
                برای فعال‌کردن شبکه‌بندی از مسیر <code>Tools -> Options -> Document Properties -> Grid/Snap</code> استفاده کنید.<br>
                پنجره Options شامل دو سربرگ <strong>System Options</strong> (تنظیمات نرم‌افزار) و <strong>Document Properties</strong> (تنظیمات فایل جاری) است.
              </div>
            </div>
          </div>
        `,
        shortcuts: [
          { kbd: 'Space', fa: 'نمایش پنجره مکعبی و دایره‌ای جهت‌گیری نماها (View Orientation)', en: 'View Orientation dialog' },
          { kbd: 'Ctrl + 1', fa: 'نمای رو به رو (Front View)', en: 'Front View' },
          { kbd: 'Ctrl + 2', fa: 'نمای پشت (Back View)', en: 'Back View' },
          { kbd: 'Ctrl + 3', fa: 'نمای چپ (Left View)', en: 'Left View' },
          { kbd: 'Ctrl + 4', fa: 'نمای راست (Right View)', en: 'Right View' },
          { kbd: 'Ctrl + 5', fa: 'نمای بالا (Top View)', en: 'Top View' },
          { kbd: 'Ctrl + 6', fa: 'نمای زیر و کف (Bottom View)', en: 'Bottom View' },
          { kbd: 'Ctrl + 7', fa: 'نمای سه‌بعدی ایزومتریک استاندارد (Isometric View)', en: 'Isometric View' },
          { kbd: 'Ctrl + 8', fa: 'دید عمود بر صفحه یا سطح انتخابی (Normal To)', en: 'Normal To View' },
          { kbd: 'F', fa: 'نمایش کلیه ترسیمات به اندازه کادر به همراه مبدا مختصات (Zoom to Fit)', en: 'Zoom to Fit' },
          { kbd: 'Z', fa: 'کوچک‌نمایی تدریجی دوربین (Zoom Out)', en: 'Zoom Out' },
          { kbd: 'Shift + Z', fa: 'بزرگ‌نمایی تدریجی دوربین (Zoom In)', en: 'Zoom In' },
          { kbd: 'C', fa: 'نمایش یا مخفی کردن نمودار درختی طراحی (FeatureManager Tree)', en: 'Collapse/Expand Feature Tree' },
          { kbd: 'Ctrl + کلیک اسکرول', fa: 'جابجایی نما روی صفحه (Pan)', en: 'Pan View' },
          { kbd: 'Alt + کلیک اسکرول', fa: 'چرخش زاویه‌ای نما حول محور عمود بر دید', en: 'Roll View' },
          { kbd: 'چرخش اسکرول ماوس', fa: 'بزرگ‌نمایی به سمت نشانگر ماوس', en: 'Zoom to cursor' }
        ]
      }
    },
    {
      id: 'ch4',
      num: 'فصل ۰۴',
      numEn: 'CH 04',
      title: 'ماژول مدل‌سازی سه‌بعدی قطعه (Features)',
      titleEn: '3D Part Modeling & Features Module',
      icon: 'box',
      badge: 'مدل‌سازی احجام و فیچرهای ۳ بعدی',
      summary: 'روش‌های حجم‌دهی Extrude Boss/Base، شرط‌های پایانی Blind تا Up to Body، برش Extrude Cut، فیلت و چمفر، Revolve، Sweep، Loft، ساخت فنر با Helix، ابزار Rib، Shell، Draft، سوراخ‌کاری Hole Wizard و متریال.',
      summaryEn: 'Extruded Boss/Base end conditions, Extrude Cut, Fillet/Chamfer, Revolve, Sweep, Loft, Helix springs, Rib, Shell, Draft, Hole Wizard, and Materials.',
      content: {
        intro: `
          <div class="sw-callout sw-callout-success">
            <i data-lucide="compass" class="sw-callout-icon"></i>
            <div class="sw-callout-content">
              <div class="sw-callout-title" data-en="Golden Rule of 3D Modeling" data-fa="نکته استراتژیک شروع در مدل‌سازی سه‌بعدی">نکته استراتژیک شروع در مدل‌سازی سه‌بعدی</div>
              <div data-en="In 3D part modeling, unlike 2D sketching, the crucial first step is selecting the optimal coordinate plane (Front, Top, or Right) for starting the base feature. Choosing the right plane minimizes required operations and enables clean subsequent extrusions and cuts." data-fa="<strong>نکته کلیدی:</strong> در زمان کار در محیط طراحی سه‌بعدی برخلاف محیط دو بعدی، اولین گام انتخاب بهترین صفحه از صفحات طراحی برای شروع کار است. انتخاب صفحه مناسب به ما جهت ترسیم راحت‌تر ترسیمات سه‌بعدی کمک شایانی خواهد کرد.">
                <strong>نکته کلیدی:</strong> در زمان کار در محیط طراحی سه‌بعدی برخلاف محیط دو بعدی، اولین گام انتخاب بهترین صفحه از صفحات طراحی برای شروع کار است که در تسریع ترسیمات سه‌بعدی بسیار موثر است.
              </div>
            </div>
          </div>
        `,
        endConditions: [
          { name: 'Blind', fa: 'با مقداردهی عددی', desc: 'حجم‌دهی مستقیم به اندازه عمق مشخص به میلی‌متر.' },
          { name: 'Through All', fa: 'تا آخرین سطح مدل', desc: 'عبور کامل از تمام حجم‌های موجود در مدل.' },
          { name: 'Up To Vertex', fa: 'تا نقطه یا رأس معین', desc: 'امتداد حجم تا تراز ارتفاعی یک راس یا نقطه انتخابی.' },
          { name: 'Up To Next', fa: 'تا اولین سطح بعدی', desc: 'حجم‌دهی تا برخورد با اولین سطح مسدودکننده در مسیر.' },
          { name: 'Up To Surface', fa: 'تا یک سطح مشخص', desc: 'حجم‌دهی تا منطبق شدن با یک سطح مسطح یا منحنی انتخابی.' },
          { name: 'Up To Body', fa: 'تا جسم یا بادی بعدی', desc: 'امتداد حجم تا برخورد با یک بدنه صلب مجزای دیگر در مدل‌های چندتکه.' }
        ],
        featuresList: [
          { name: 'Extruded Boss / Base', fa: 'ایجاد حجم مستقیم', desc: 'تبدیل اسکچ دوبعدی به حجم صلب سه‌بعدی با شرایط پایانی متنوع و امکان زاویه شیب خروج از قالب (Draft).' },
          { name: 'Extrude Cut', fa: 'ایجاد برش حجمی و سوراخ', desc: 'براده‌برداری و سوراخ‌کاری در احجام سه‌بعدی با شرایط پایانی مشابه اکسترود.' },
          { name: 'Fillet & Chamfer', fa: 'گرد کردن لبه و پخ زدن', desc: 'Fillet برای ایجاد گوشه‌های هلالی با شعاع R و Chamfer برای پخ زدن زاویه‌دار (مثلاً ۴۵ درجه) جهت تنش‌زدایی و مونتاژ آسان.' },
          { name: 'Revolved Boss & Cut', fa: 'تولید حجم و شیار دوار حول محور', desc: 'دوران یک مقطع بسته حول خط محور برای ساخت قطعات متقارن‌المحور مانند شفت، پولی، کاسه‌نمد و فلنج.' },
          { name: 'Sweep & Sweep Cut', fa: 'حجم‌سازی روی یک منحنی', desc: 'حرکت مقطع دوبعدی (Profile) در امتداد یک مسیر پیوسته (Path) به همراه منحنی‌های راهنما (Guide Curves)؛ جهت لوله‌کشی و ساخت فنر.' },
          { name: 'Plane Creation', fa: 'ساخت صفحات کمکی جدید', desc: 'ایجاد صفحات هندسی موازی، زاویه‌دار، مماس یا گذرنده از نقاط برای باز کردن اسکچ‌های جدید.' },
          { name: 'Convert Entities', fa: 'تصویر عناصر سه‌بعدی بر دو بعدی', desc: 'پروجکت کردن لبه‌ها و مرزهای احجام موجود بر روی اسکچ جاری بدون نیاز به ترسیم مجدد.' },
          { name: 'Helix / Spiral & Springs', fa: 'ایجاد فنر و مسیر مارپیچ', desc: 'تولید مارپیچ با تعیین گام (Pitch)، تعداد دور (Revolutions) و زاویه اولیه؛ سپس ساخت صفحه عمود بر نقطه شروع و اعمال Sweep برای مدل‌سازی فنر.' },
          { name: 'Lofted Boss & Cut', fa: 'تولید حجم با تغییر شکل مقطع', desc: 'حجم‌دهی بین چند مقطع هندسی متفاوت (مثلاً دایره به مربع یا پره توربین) با منحنی‌های راهنمای سه‌بعدی.' },
          { name: 'Rib Tool', fa: 'ایجاد تیغه و لچکی تقویتی', desc: 'افزودن دیواره‌های تقویتی نازک با یک خط ساده به همراه تعیین ضخامت و جهت اضافه شدن متریال.' },
          { name: 'Draft Tool', fa: 'ایجاد شیب قالب‌گیری', desc: 'اعمال زاویه شیب بر وجوه قطعه نسبت به صفحه خنثی (Neutral Plane) جهت خروج آسان از قالب تزریق پلاستیک و ریخته‌گری.' },
          { name: 'Shell Tool', fa: 'ایجاد پوسته توخالی', desc: 'خالی کردن داخل قطعه با ضخامت دیواره یکنواخت و حذف وجوه باز.' },
          { name: 'Hole Wizard', fa: 'ایجاد انواع سوراخ‌های استاندارد', desc: 'سوراخ‌کاری مهندسی شامل خزینه‌دار، کف‌تخت آلنی، و قلاویزکاری رزوه مطابق استاندارد DIN و ISO.' },
          { name: 'Material Library', fa: 'تخصیص خواص فیزیکی متریال', desc: 'انتخاب آلیاژهای آلومینیوم، فولاد، پلیمرها و استخراج چگالی، مدول الاستیسیته، ضریب پواسون و تنش تسلیم.' },
          { name: 'Cosmetic Thread', fa: 'رزوه ظاهری سبک', desc: 'ایجاد مشخصات رزوه پیچ و مهره بدون ایجاد هندسه سنگین مارپیچ سه‌بعدی (مسیر: Insert -> Annotation -> Cosmetic Thread).' }
        ]
      }
    },
    {
      id: 'ch5',
      num: 'فصل ۰۵',
      numEn: 'CH 05',
      title: 'محیط مونتاژ قطعات و مکانیزم‌ها (Assembly)',
      titleEn: 'Assembly Environment & Mechanisms',
      icon: 'layers',
      badge: 'مونتاژ، قیود و مکانیزم‌ها',
      summary: 'فرمت‌های sldasm، روش‌های Bottom-Up و Top-Down، قطعه پایه Fixed، قیود استاندارد، پیشرفته و مکانیکی (Gear, Cam, Screw, Rack & Pinion, Hinge)، بررسی برخورد و ذخیره‌سازی.',
      summaryEn: 'Assembly file formats, Bottom-Up vs Top-Down workflows, Fixed base component, Standard/Advanced/Mechanical Mates, and Interference Detection.',
      content: {
        intro: `
          <div class="sw-callout sw-callout-success">
            <i data-lucide="anchor" class="sw-callout-icon"></i>
            <div class="sw-callout-content">
              <div class="sw-callout-title" data-en="Assembly Workflows & Base Component Rule" data-fa="متدولوژی‌های مونتاژ و قانون قطعه ثابت (Fixed)">متدولوژی‌های مونتاژ و قانون قطعه ثابت (Fixed)</div>
              <div data-en="Assemblies (.sldasm) can be designed via two methods: 1. Bottom-Up (designing parts separately and inserting via Insert Component) & 2. Top-Down (designing parts in-place via New Part). CRITICAL NOTE: The first component inserted into the assembly is automatically locked in place, fixed, and displays an '(f)' tag in the FeatureManager tree. Subsequent parts show a '(-)' symbol indicating free degrees of freedom." data-fa="برای مونتاژ قطعات از محیط Assembly استفاده می‌شود (.sldasm و .asm).<br><strong>روش اول:</strong> طراحی جداگانه قطعات در فایل‌های مجزا و وارد کردن با Insert Component.<br><strong>قانون طلایی مونتاژ:</strong> اولین قطعه‌ای که وارد محیط مونتاژ می‌شود دارای موقعیت ثابت می‌باشد و نمی‌توان آن را حرکت یا دوران داد و با علامت <code>(f)</code> در کنار نام قطعه در نمودار درختی نمایش داده می‌شود. بهتر است ابتدا با <code>View -> Origins</code> مرکز صفحه را فعال کرده و قطعه اصلی را روی مرکز قرار دهید. قطعات بعدی با علامت <code>(-)</code> نمایش داده می‌شوند که نشان‌دهنده نامشخص بودن موقعیت و امکان جابجایی آن‌هاست.<br><strong>روش دوم:</strong> طراحی درجا در زیرمجموعه محیط Assembly با دستور <code>Insert Component -> New Part</code> و انتخاب یک وجه مسطح قطعه موجود.">
                <strong>قانون طلایی مونتاژ:</strong> اولین قطعه‌ای که وارد محیط Assembly می‌شود دارای موقعیت ثابت <code>(f)</code> است. قطعات بعدی شناور بوده و با علامت <code>(-)</code> مشخص می‌شوند.
              </div>
            </div>
          </div>
        `,
        mates: [
          { group: 'Standard Mates', list: 'Coincident (انطباق وجه و لبه) &bull; Parallel (توازی سطوح) &bull; Perpendicular (تعامد) &bull; Tangent (مماسی) &bull; Concentric (هم‌محوری سوراخ و پین) &bull; Lock (قفل صلب) &bull; Distance (فاصله مشخص) &bull; Angle (زاویه مشخص)' },
          { group: 'Advanced Mates (قیود پیشرفته)', list: 'Symmetric (تقارن دو قطعه نسبت به صفحه میانی) &bull; Width (سنتر کردن متقارن زبانه در شکاف) &bull; Path Mate (مهار حرکت روی مسیر سه‌بعدی) &bull; Linear/Linear Coupler (کوپل کردن حرکت خطی دو قطعه با نسبت معین)' },
          { group: 'Mechanical Mates (قیود مکانیزم)', list: 'Cam (مماس نگه داشتن پیرو روی بادامک) &bull; Gear (کوپل کردن حرکت دورانی دو چرخدنده با نسبت دنده) &bull; Hinge (لولا با محدودیت زاویه حرکت) &bull; Rack and Pinion (تبدیل حرکت خطی شانه به دورانی پینیون) &bull; Screw (تبدیل دوران پیچ به پیشروی خطی با گام Pitch) &bull; Universal Joint (مفصل چهارشاخ کاردان برای انتقال گشتاور در زوایای متغیر)' }
        ],
        tools: [
          { name: 'Interference Detection', fa: 'بررسی تداخل قطعات', desc: 'اسکن تمام قطعات اسمبلی و نمایش تداخل‌های فیزیکی بین قطعات با هایلایت قرمز جهت جلوگیری از خطای ساخت.' },
          { name: 'Exploded View', fa: 'نمای انفجاری مونتاژ', desc: 'ایجاد نمای انفجاری مرحله به مرحله با خطوط راهنمای انفجاری و قابلیت ضبط و پخش انیمیشن باز و بسته شدن.' },
          { name: 'Replace Component', fa: 'جایگزینی هوشمند قطعه', desc: 'تعویض یک قطعه با مدل ویرایش‌شده بدون از بین رفتن قیود مونتاژی.' },
          { name: 'Pack and Go', fa: 'بسته‌بندی و ذخیره‌سازی کامل', desc: 'تجمیع تمام فایل‌های سه‌بعدی، قطعات استاندارد، زیرمجموعه‌ها و نقشه‌ها در یک پوشه فشرده برای انتقال به سیستم‌های دیگر.' }
        ]
      }
    },
    {
      id: 'ch6',
      num: 'فصل ۰۶',
      numEn: 'CH 06',
      title: 'محیط تهیه نقشه‌های اجرایی و نقشه‌خوانی (Drawing)',
      titleEn: 'Engineering Drawing & Detailing',
      icon: 'file-text',
      badge: 'نقشه‌کشی، برش‌ها و جدول BOM',
      summary: 'تنظیم شیت، استخراج نماهای ارتوگرافیک، برش طولی و موضعی Broken-out، بزرگ‌نمایی جزئیات Detail View، تلرانس‌های GD&T، جدول قطعات BOM با فرمول هزینه و بالن‌گذاری خودکار.',
      summaryEn: 'Sheet format customization, orthographic projections, Section/Broken-out views, GD&T geometric tolerancing, BOM cost equation, and Auto Ballooning.',
      content: {
        intro: `
          <div class="sw-callout">
            <i data-lucide="file-check" class="sw-callout-icon"></i>
            <div class="sw-callout-content">
              <div class="sw-callout-title" data-en="Drawing Formats & Sheet Configuration" data-fa="فرمت‌ها، اندازه‌های کاغذ و ویرایش جدول و کادر نقشه">فرمت‌ها، اندازه‌های کاغذ و ویرایش جدول و کادر نقشه</div>
              <div data-en="Drawing files use .slddrw or .drw, and can be exported to .dwg or .dxf for AutoCAD interoperability. Access via File -> New -> Drawing or File -> Make Drawing From Part. Customize title blocks and sheet borders by right-clicking on the drawing sheet and choosing 'Edit Sheet Format'." data-fa="نقشه‌های طراحی شده با پسوند <code>slddrw.*</code> و <code>drw.*</code> ذخیره می‌شوند و قابلیت خروجی با فرمت‌های <code>dxf.*</code> و <code>dwg.*</code> جهت اتوکد را دارا هستند.<br>برای ورود از منوی <code>File -> Make Drawing From Part</code> استفاده کنید. پس از انتخاب اندازه استاندارد کاغذ (A4، A3 و...)، برای ویرایش جدول و کادرها بر روی فضای کاغذ راست‌کلیک کرده و گزینه <strong>Edit Sheet Format</strong> را انتخاب کنید.">
                نقشه‌ها با فرمت‌های <code>slddrw.*</code> و قابلیت اکسپورت به <code>dwg.*</code> و <code>dxf.*</code> ایجاد می‌شوند.<br>
                برای ویرایش جدول و کادر مشخصات، روی کاغذ راست‌کلیک کرده و گزینه <strong>Edit Sheet Format</strong> را انتخاب کنید.
              </div>
            </div>
          </div>
        `,
        viewsList: [
          { name: 'Model View & Standard 3 View', fa: 'سه نمای اصلی و نمای سه‌بعدی', desc: 'وارد کردن خودکار سه نمای روبه‌رو، بالا و راست به همراه نمای ایزومتریک.' },
          { name: 'Projected View', fa: 'نمای فرودگاهی متصل', desc: 'استخراج نماهای جانبی عمود بر نمای مبنا با حرکت ماوس.' },
          { name: 'Section View', fa: 'نمای برش کامل با Flip Direction', desc: 'برش قطعه با خط برش افقی یا عمودی و امکان معکوس کردن دید برش با دکمه Flip Direction.' },
          { name: 'Broken-out Section', fa: 'برش موضعی پله‌ای با عمق رفرنس', desc: 'رسم یک اسپیلاین بسته دور ناحیه مورد نظر و تعیین عمق برش (Depth Reference) با کلیک روی لبه سوراخ داخلی و تنظیم ضریب هاشور (Hatch Pattern Scale به ۴).' },
          { name: 'Detail View', fa: 'بزرگ‌نمایی جزئیات با کادر دایره', desc: 'ترسیم دایره حول جزئیات ظریف قطعه و ایجاد نمای بزرگ‌نمایی‌شده با مقیاس ۲:۱ یا بیشتر.' },
          { name: 'Crop View', fa: 'برش و حذف اضافات نقشه', desc: 'کشیدن یک منحنی اسپیلاین بسته و برش زدن کل نمای نقشه برای متمرکز شدن بر یک بخش خاص.' },
          { name: 'Auxiliary View', fa: 'نمای کمکی سطوح شیب‌دار', desc: 'ایجاد نمای مستقیم عمود بر یال‌های زاویه‌دار جهت نمایش اندازه حقیقی سطوح مورب.' }
        ],
        detailingTools: [
          { name: 'Auto Dimension', fa: 'اندازه‌گذاری اتوماتیک مبنایی', desc: 'انتخاب لبه‌های مبنای افقی و عمودی (Datum Edges) و تولید خودکار کلیه فواصل در زیر (Below) یا کنار (Left/Right) نما.' },
          { name: 'Model Items', fa: 'فراخوانی ابعاد از مدل سه‌بعدی', desc: 'انتقال مستقیم کلیه اندازه‌های تعریف‌شده در پارت به نقشه با گزینه Eliminate duplicates جهت حذف تکرارها.' },
          { name: 'Geometric Tolerance (GD&T)', fa: 'تلرانس‌های هندسی و دیتوم', desc: 'تعریف تلرانس‌های تختی، تعامد، توازی، موقعیت و دیتوم‌های مبنا (Datum Feature A, B) طبق استاندارد ASME Y14.5.' },
          { name: 'Bill of Materials (BOM)', fa: 'جدول لیست قطعات و متریال', desc: 'استخراج لیست قطعات اسمبلی، انتخاب قالب BomTemplate با فرمت Parts only، درج ستون قیمت Price و فرمول‌نویسی هزینه در ستون Cost با Equation: QTY * Price.' },
          { name: 'Auto Balloon', fa: 'بالن‌گذاری خودکار قطعات', desc: 'شماره‌گذاری اتوماتیک تمام قطعات در نمای انفجاری با اتصال به ردیف‌های جدول BOM.' }
        ]
      }
    }
  ],
  exercises: [
    {
      id: 'ex1',
      type: '2D Sketch',
      title: 'بازوی سه پره اسپایدر (Three-Lobe Spider Flange)',
      titleEn: 'Three-Lobe Spider Flange',
      image: 'assets/images/blueprints/blueprint-ex1-spider-flange.svg',
      dims: 'سوراخ‌های سه‌گانه Ø20 &bull; شعاع پره‌ها R30 &bull; دایره توزیع Ø200 &bull; فواصل طولی 120 و 80 و 60',
      desc: 'ترسیم دو بعدی متقارن بازوی سه‌گانه با استفاده از قیدهای شعاعی و تکثیر دایروی.',
      steps: [
        '۱. در محیط Sketch یک دایره مرکزی کمکی (For construction) به قطر Ø200 رسم کنید.',
        '۲. در بالاترین نقطه، یک دایره Ø20 و یک کمان خارجی R30 هم‌مرکز رسم کنید.',
        '۳. با دستور Circular Sketch Pattern پره بالا را با زاویه ۱۲۰ درجه و ۳ نسخه تکثیر کنید.',
        '۴. کمان‌های اتصالی بین پره‌ها را با ابزار 3-Point Arc یا Fillet با شعاع مماس R30 کامل کنید.',
        '۵. فواصل 120، 80 و 60 را با Smart Dimension قیدگذاری کنید تا تمام خطوط مشکی (Fully Defined) شوند.'
      ]
    },
    {
      id: 'ex2',
      type: '2D Sketch',
      title: 'فلانژ چهارگوش صنعتی (4-Hole Industrial Flange)',
      titleEn: '4-Hole Industrial Mounting Flange',
      image: 'assets/images/blueprints/blueprint-ex2-industrial-flange.svg',
      dims: '۴ سوراخ Ø20 &bull; شعاع گوشه‌ها R18 &bull; زوایای ۳۰ درجه &bull; دایره‌های مرکزی Ø90 و Ø55 &bull; فواصل 60 و 8',
      desc: 'ترسیم فلانژ رابط زاویه‌دار با خطوط تقارن و شیارهای زاویه ۳۰ درجه.',
      steps: [
        '۱. رسم دو دایره مرکزی به قطرهای Ø55 و Ø90 حول مبدا مختصات.',
        '۲. رسم دو خط محور Centerline متقاطع با زاویه ۳۰ درجه.',
        '۳. رسم دایره سوراخ Ø20 و کمان خارجی R18 در راستای خط محور زاویه‌دار.',
        '۴. استفاده از دستور Mirror Entities یا Circular Pattern برای ایجاد ۴ گوشه فلانژ.',
        '۵. اتصال لبه‌ها با خطوط مماس و قیدگذاری عرض شیار به اندازه 8 و فاصله 60.'
      ]
    },
    {
      id: 'ex3',
      type: '2D Sketch',
      title: 'شاتون موتور خودرو (Automotive Connecting Rod)',
      titleEn: 'Automotive Engine Connecting Rod',
      image: 'assets/images/blueprints/blueprint-ex3-connecting-rod.svg',
      dims: 'فاصله مراکز 250 و 150 &bull; سوراخ بزرگ Ø52 با بدنه Ø63 &bull; سوراخ کوچک Ø24 با بدنه R35 &bull; ۴ سوراخ یاتاقان Ø10 &bull; قوس‌های R72 و R6 &bull; ضخامت مقطع 26 و 18',
      desc: 'ترسیم مهندسی شاتون با مقطع H شکل، یاتاقان‌های دو طرف و قوس‌های تنش‌زدایی بدنه.',
      steps: [
        '۱. رسم خط محور افقی Centerline به طول 250 میلی‌متر بین مرکز یاتاقان سر بزرگ و سر کوچک.',
        '۲. در سر بزرگ: رسم دایره‌های Ø52 و Ø63، سپس ۴ سوراخ پیچ یاتاقان Ø10 در فواصل 17، 26 و 40.',
        '۳. در سر کوچک: رسم دایره Ø24 و کمان بدنه R35 در فاصله 250 از مرکز اصلی.',
        '۴. ترسیم بدنه شاتون با خطوط افقی موازی به عرض 26 و 18 و ایجاد قوس‌های اتصالی مماسی با شعاع R72 و R6.',
        '۵. کنترل قیود مماسی Tangent و تقارن Symmetric تا مشکی شدن کامل کل شاتون.'
      ]
    },
    {
      id: 'ex4',
      type: '3D Part',
      title: 'قطعه شیب‌دار F-شکل زاویه‌دار (F-Bracket with Angled Extrusion)',
      titleEn: 'Angled F-Bracket',
      image: 'assets/images/blueprints/blueprint-ex4-f-bracket.svg',
      dims: 'ارتفاع کل 93 &bull; کفی 50 &bull; ضخامت پله‌ها 18 &bull; لبه‌های 28 و 22 و 45 &bull; شیار 10 میلی‌متری در طول 90 با زاویه شیب',
      desc: 'مدل‌سازی سه‌بعدی قطعه F-شکل با اکسترود پایه و ایجاد حجم شیب‌دار زاویه‌دار به طول ۹۰.',
      steps: [
        '۱. انتخاب صفحه Front Plane و ترسیم پروفیل دوبعدی حرف F با ابعاد 93، 50، 18، 28 و 22.',
        '۲. اعمال Extruded Boss/Base با عمق Blind به میزان 18 میلی‌متر.',
        '۳. انتخاب وجه پشتی و ترسیم مثلث زاویه‌دار شیب‌دار با ابعاد 40، 22 و طول 90.',
        '۴. اعمال اکسترود کات شیار 10 میلی‌متری در امتداد یال شیب‌دار تا عمق مورد نظر.'
      ]
    },
    {
      id: 'ex5',
      type: '3D Part',
      title: 'بلوک متقارن H شکل با برش‌های استوانه‌ای (Symmetric H-Block with Cylinder Cutaways)',
      titleEn: 'Symmetric H-Block',
      image: 'assets/images/blueprints/blueprint-ex5-h-block.svg',
      dims: 'ابعاد مکعب 62 در 50 در 44 &bull; سوراخ مرکزی سرتاسری Ø20 &bull; دو برش نیم‌سیلندری جانبی R15 &bull; شیارهای مکعبی داخلی 14×18 با دیواره‌های 12، 15 و 16',
      desc: 'مدل‌سازی بلوک ماشین‌کاری شده با سوراخ مرکزی و شیارهای دقیق.',
      steps: [
        '۱. انتخاب Top Plane و اکسترود مستطیل 62×50 تا ارتفاع 44 میلی‌متر با گزینه Mid Plane.',
        '۲. روی وجه بالایی: ترسیم سوراخ Ø20 در مرکز و دو کمان R15 در طرفین با فاصله 28 و 17.',
        '۳. اعمال Extrude Cut با شرط Through All.',
        '۴. روی وجه روبه‌رو: ترسیم شیار چهارگوش 14×18 با فواصل 12 و 16 و برش سرتاسری.'
      ]
    },
    {
      id: 'ex6',
      type: '3D Part',
      title: 'بلوک ذوزنقه‌ای با شیار مرکزی U و پخ‌های مرکب (Chamfered V-Block)',
      titleEn: 'Chamfered V-Block with Center Channel',
      image: 'assets/images/blueprints/blueprint-ex6-v-block.svg',
      dims: 'کفی 68 در 48 &bull; ارتفاع 42 &bull; شیار مرکزی U با عرض 18 &bull; پخ‌های مرکب دوطرفه 15×18 و 12×15 و پخ پایه 5×68',
      desc: 'مدل‌سازی بلوک ذوزنقه‌ای صلب با شیار میانی و آموزش اعمال دستورات Fillet و Chamfer.',
      steps: [
        '۱. در صفحه Front مقطع ذوزنقه‌ای با پایه 68، عرض بالای 48 و ارتفاع 42 را ترسیم و تا عمق 68 اکسترود کنید.',
        '۲. روی وجه بالایی، شیار مرکزی به عرض 18 و عمق مشخص را با Extrude Cut برش دهید.',
        '۳. با ابزار Chamfer پخ‌های دو فاصله‌ای 15×18 را در لبه‌های مایل بالا اعمال کنید.',
        '۴. پخ‌های پله پایینی 12×15 و 5 را در یال‌های انتهایی اضافه کنید.'
      ]
    },
    {
      id: 'ex7',
      type: '3D Part',
      title: 'پایه نگهدارنده شیب‌دار با لچکی‌های تقویتی و مقاطع برشی G-G و F-F',
      titleEn: 'Angled Mounting Bracket with Gussets',
      image: 'assets/images/blueprints/blueprint-ex7-mounting-bracket.svg',
      dims: 'طول پایه 81 &bull; ارتفاع 26 &bull; زاویه 114° و 24° &bull; شیب دیواره 52° &bull; ضخامت 4 میلی‌متر &bull; لچکی‌های تقویتی R3 &bull; سوراخ‌های زبانه',
      desc: 'مدل‌سازی پایه ریخته‌گری زاویه‌دار با دیواره‌های جدارنازک و تیغه‌های تقویتی Rib.',
      steps: [
        '۱. مدل‌سازی پایه کفی به طول 81 و ضخامت 4 با سوراخ لوبیایی.',
        '۲. ایجاد صفحه کمکی Plane با زاویه 52 درجه نسبت به کف.',
        '۳. ترسیم دیواره شیب‌دار با زاویه 114 و 24 درجه و سوراخ‌های Ø10.',
        '۴. ترسیم خطوط کمکی و استفاده از ابزار Rib برای ایجاد دو لچکی تقویتی با ضخامت 4 و شعاع بالای R3.'
      ]
    },
    {
      id: 'ex8',
      type: '3D Part',
      title: 'لوله زانودار خمیده فضایی با دستور Sweep',
      titleEn: '3D Curved Pipe Sweep',
      image: 'assets/images/blueprints/blueprint-ex8-pipe-sweep.svg',
      dims: 'مسیر منحنی چند زانویی متوالی فضایی &bull; قطر خارجی و قطر داخلی لوله',
      desc: 'مدل‌سازی لوله هیدرولیکی خمیده با ابزار Sweep Boss/Base و مقطع دایره‌ای روی مسیر سه بعدی.',
      steps: [
        '۱. در صفحه Front مسیر خمیده خط لوله را با خطوط و فیلت‌های مماسی رسم کنید (Path).',
        '۲. با ابزار Plane، صفحه‌ای عمود بر ابتدای مسیر ایجاد کنید.',
        '۳. روی صفحه جدید مقطع لوله (دو دایره متحدالمرکز برای جدار لوله) را رسم کنید (Profile).',
        '۴. دستور Swept Boss/Base را اجرا کرده و مقطع و مسیر را معرفی کنید.'
      ]
    },
    {
      id: 'ex9',
      type: 'Assembly',
      title: 'مکانیزم لنگ و لغزنده (Slider-Crank Mechanism)',
      titleEn: 'Slider-Crank Assembly Mechanism',
      image: 'assets/images/blueprints/blueprint-ex9-slider-crank.svg',
      dims: 'ریل راهنما 100 با مقطع 10×10 &bull; لغزنده مکعبی 10×10×10 &bull; بازوی بلند 58 با ضخامت 2.5 و پین‌های R2.5 و R3.5 &bull; بازوی کوتاه 28 با پین R2.5',
      desc: 'مونتاژ مکانیزم تبدیل حرکت دورانی به رفت و برگشتی با قیود هم‌محوری، انطباق و حرکت دینامیکی.',
      steps: [
        '۱. ریل راهنمای 100×10×10 را به عنوان قطعه اول وارد کرده و روی مبدا ثابت (Fixed) کنید.',
        '۲. بلوک لغزنده مکعبی را وارد کرده و با قید Coincident روی سطح ریل مقید کنید تا فقط در طول بلغزد.',
        '۳. بازوی شاتون 58 و لنگ 28 را با Insert Component وارد محیط کنید.',
        '۴. با قید Concentric، پین انتهای شاتون را در سوراخ لغزنده و سر دیگر را به لنگ متصل کنید.',
        '۵. لنگ را به پایه مقید کنید و با Move Component تست حرکت سینماتیکی پیوسته را مشاهده نمایید.'
      ]
    },
    {
      id: 'ex10',
      type: 'Drawing & BOM',
      title: 'پروژه جامع نقشه‌کشی بدنه غذاساز صنعتی (Food Processor Blueprint)',
      titleEn: 'Food Processor Comprehensive 4-Sheet Engineering Drawing',
      image: 'assets/images/blueprints/blueprint-ex10-food-processor.svg',
      dims: 'ابعاد 90.20 و 70 و 37 &bull; شعاع‌های R59.16 و R12.50 &bull; برش Section Q-Q &bull; دیتوم A &bull; برش موضعی Broken-out با مقیاس هاشور 4 &bull; جدول قطعات BOM با فرمول QTY*Price و بالن‌گذاری Auto Balloon',
      desc: 'پروژه پایانی جامع ۴ شیته شامل تمام استانداردهای نقشه کشی صنعتی، برش‌ها، تلرانس‌های GD&T، جدول BOM و فرمول هزینه.',
      steps: [
        'شیت ۱: باز کردن فایل FoodProcessor.slddrw، اجرای Section View افقی با Auto-start section view و برگرداندن دید با Flip Direction.',
        'شیت ۲: اندازه‌گذاری خودکار Auto Dimension با انتخاب لبه‌های مبنا، درج تلرانس هندسی GD&T عمود بودن 0.5 نسبت به مبنای A (Datum Feature A) و افزودن پیشوند و پسوند W.T. TYP و 2X R.',
        'شیت ۳: استخراج نمای راست با Projected View، اجرای برش موضعی Broken-out Section با اسپیلاین و تعیین Depth Reference از لبه سوراخ داخلی، تغییر Hatch Pattern Scale به ۴، و نوشتن یادداشت مهندسی با ابزار Note.',
        'شیت ۴: وارد کردن مدل مونتاژ موتور casing motor.sldasm، نمای بزرگ‌نمایی شده Detail View، استخراج جدول Bill of Materials (BOM) با Parts only، تعیین ستون سفارشی قیمت Price و فرمول‌نویسی ستون هزینه Cost با رابطه Equation: QTY * Price، و در نهایت شماره‌گذاری خودکار کلیه قطعات با Auto Balloon!'
      ]
    }
  ],
  quiz: [
    {
      id: 1,
      qFa: 'رنگ‌های آبی، مشکی، زرد و قرمز در اسکچ سالیدورکس به ترتیب بیانگر چه وضعیتی هستند؟',
      qEn: 'What do Blue, Black, Yellow, and Red colors represent in a SolidWorks sketch?',
      optionsFa: [
        'آبی: قید اضافی / مشکی: تعریف نشده / زرد: خطا / قرمز: تایید شده',
        'آبی: تعریف نشده (دارای آزادی) / مشکی: کاملاً مقید (فولی) / زرد: قید تکراری / قرمز: خطای متناقض',
        'آبی: خط ساختمانی / مشکی: خط برش / زرد: اندازه اتوکد / قرمز: اخطار سیستم',
        'آبی: قطعه آماده / مشکی: پارت خام / زرد: مونتاژ / قرمز: متریال ناقص'
      ],
      optionsEn: [
        'Blue: Over-defined / Black: Under-defined / Yellow: Error / Red: Solved',
        'Blue: Under-defined (degrees of freedom) / Black: Fully defined / Yellow: Over-defined (redundant) / Red: Unsolvable conflict',
        'Blue: Construction / Black: Cut line / Yellow: Reference / Red: Warning',
        'Blue: Ready / Black: Raw / Yellow: Assembly / Red: Incomplete'
      ],
      correct: 1,
      expFa: 'در سالیدورکس: آبی یعنی ترسیماتی که به اندازه کافی قیدگذاری نشده‌اند (Under-defined)؛ مشکی یعنی کاملاً تعریف شده (Fully Defined)؛ زرد یعنی دارای قید تکراری؛ و قرمز یعنی دارای خطا و قیود متناقض.',
      expEn: 'In SolidWorks: Blue is under-defined, Black is fully defined, Yellow has redundant relations, and Red indicates mathematical conflicts.'
    },
    {
      id: 2,
      qFa: 'خروج از اسکچ با کلیک روی ضربدر قرمز چه تفاوتی با آیکون Exit Sketch دارد؟',
      qEn: 'What is the difference between clicking the red cross vs the Exit Sketch icon?',
      optionsFa: [
        'هیچ تفاوتی ندارند و هر دو اسکچ را ذخیره می‌کنند.',
        'ضربدر قرمز فایل را به اتوکد صادر می‌کند ولی Exit Sketch حجم می‌دهد.',
        'ضربدر قرمز کلیه ترسیمات انجام‌شده در آن اسکچ را پاک کرده و بدون ذخیره خارج می‌شود!',
        'ضربدر قرمز ترسیمات را به حالت ایزومتریک می‌برد.'
      ],
      optionsEn: [
        'No difference, both save the sketch.',
        'Red cross exports to AutoCAD while Exit Sketch extrudes.',
        'Red cross deletes all sketch entities created in that session and exits without saving!',
        'Red cross toggles isometric orientation.'
      ],
      correct: 2,
      expFa: 'علامت ضربدر قرمز در گوشه بالای صفحه، کلیه تغییرات اخیر همان Sketch را لغو کرده و بدون ذخیره خارج می‌شود؛ در حالی که آیکون سمت چپ (تایید) تغییرات را ذخیره می‌کند.',
      expEn: 'The red cross in the top confirmation area discards all changes, clears recent sketch geometry, and exits without saving.'
    },
    {
      id: 3,
      qFa: 'کدام کلید میانبر استاندارد دوربین را عمود بر صفحه یا سطح انتخابی (Normal To) می‌چرخاند؟',
      qEn: 'Which standard shortcut key orients the camera directly perpendicular (Normal To) to the selected face/plane?',
      optionsFa: [
        'Ctrl + 1',
        'Ctrl + 7',
        'Ctrl + 8',
        'کلید Space'
      ],
      optionsEn: [
        'Ctrl + 1',
        'Ctrl + 7',
        'Ctrl + 8',
        'Space bar'
      ],
      correct: 2,
      expFa: 'کلید ترکیبی استاندارد Ctrl + 8 ابزاری برای نمایش نمای مستقیم عمود به صفحه یا سطح انتخابی (Normal To) است.',
      expEn: 'Ctrl + 8 is the universal shortcut for Normal To view in SolidWorks.'
    },
    {
      id: 4,
      qFa: 'اولین قطعه‌ای که وارد محیط Assembly می‌شود دارای چه وضعیتی است و با چه علامتی نشان داده می‌شود؟',
      qEn: 'What status does the first component inserted into an Assembly receive, and how is it identified in the tree?',
      optionsFa: [
        'شناور است و با علامت <-> نمایش داده می‌شود.',
        'کاملاً ثابت (Fixed) است و با علامت (f) در کنار نام قطعه در نمودار درختی نمایش داده می‌شود.',
        'پنهان است و با علامت چرخ‌دنده نشان داده می‌شود.',
        'به صورت خودکار قرینه می‌شود.'
      ],
      optionsEn: [
        'Floating, represented by <-> tag.',
        'Fixed in place, designated by (f) next to its name in the tree.',
        'Suppressed, designated by gear icon.',
        'Automatically mirrored across origin.'
      ],
      correct: 1,
      expFa: 'قانون استاندارد مونتاژ: اولین قطعه‌ای که وارد محیط Assembly می‌شود دارای موقعیت ثابت (Fixed) است و با علامت (f) کنار نام قطعه نمایش داده می‌شود.',
      expEn: 'The first component inserted into an assembly is fixed, locked in place, and indicated with (f) in the tree.'
    },
    {
      id: 5,
      qFa: 'برای مدل‌سازی یک فنر استوانه‌ای واقعی در سالیدورکس، کدام توالی مراحل صحیح است؟',
      qEn: 'To model a realistic industrial coil spring in SolidWorks, which procedural sequence is correct?',
      optionsFa: [
        'اکسترود مستقیم یک دایره و سپس پخ زدن لبه‌ها',
        'ترسیم Helix -> ایجاد Plane عمود بر نقطه شروع -> رسم دایره مقطع مفتول -> حجم‌دهی با Swept Boss',
        'استفاده از ابزار Hole Wizard و انتخاب فنر',
        'رسم دو مستطیل و استفاده از Revolve Cut'
      ],
      optionsEn: [
        'Extrude a circle directly and chamfer ends.',
        'Generate Helix -> Create perpendicular Plane at start point -> Sketch wire circle -> Volume via Swept Boss',
        'Pick spring from Hole Wizard dropdown.',
        'Sketch two rectangles and apply Revolve Cut.'
      ],
      correct: 1,
      expFa: 'برای مدل‌سازی فنر استاندارد: ابتدا با Curve -> Helix منحنی مارپیچ رسم شده، سپس در ابتدای آن صفحه‌ای عمود ایجاد و دایره مقطع مفتول با Swept Boss/Base در طول مسیر امتداد داده می‌شود.',
      expEn: 'Helix defines trajectory, a plane is created at its start point, the wire circle profile is sketched, and Swept Boss generates the 3D spring coil.'
    },
    {
      id: 6,
      qFa: 'قید مکانیکی Gear در محیط مونتاژ چه نقشی ایفا می‌کند؟',
      qEn: 'What does the Mechanical Mate "Gear" accomplish in an assembly?',
      optionsFa: [
        'یک چرخ‌دنده آماده از جعبه ابزار وارد می‌کند.',
        'مقید کردن حرکت چرخشی دو قطعه با یکدیگر بر اساس نسبت مشخص.',
        'تبدیل حرکت خطی شانه به دورانی پینیون.',
        'بررسی تداخل دندانه‌ها با خطای قرمز.'
      ],
      optionsEn: [
        'Inserts a premade gear from Toolbox.',
        'Couples the rotational motions of two components based on a defined ratio.',
        'Converts linear rack displacement into pinion rotation.',
        'Analyzes tooth meshing interference.'
      ],
      correct: 1,
      expFa: 'قید Gear از زیرمجموعه قیود مکانیکی (Mechanical Mate) جهت مقید کردن نسبت حرکت چرخشی دو قطعه، پولی یا چرخدنده با یکدیگر به کار می‌رود.',
      expEn: 'Gear mechanical mate couples the rotational degrees of freedom between two rotating bodies according to their pitch diameters or tooth counts.'
    },
    {
      id: 7,
      qFa: 'در محیط Drawing، فرمول‌نویسی برای ستون هزینه کل (Cost) در جدول BOM بر چه اساسی انجام می‌شود؟',
      qEn: 'In the Drawing environment BOM table, how is the Cost column calculated via Equations?',
      optionsFa: [
        'با نوشتن دستی قیمت تک‌تک قطعات در جدول بدون فرمول',
        'با انتخاب Equation در ستون Cost، تعیین دقت Precision و فرمول ضرب تعداد در قیمت واحد: QTY * Price',
        'با خروجی گرفتن به اکسل و وارد کردن مجدد نقشه',
        'با استفاده از دستور Auto Balloon'
      ],
      optionsEn: [
        'By manually retyping numbers in every cell.',
        'By clicking Equation on Cost column, setting precision, and specifying formula: QTY * Price',
        'By exporting to Excel and reimporting into drawing.',
        'Using Auto Balloon tool.'
      ],
      correct: 1,
      expFa: 'در جدول استانداردهای BOM: با انتخاب ستون Cost و زدن دکمه Equation، فرمول حاصل‌ضرب تعداد قطعه در قیمت واحد (QTY * Price) درج می‌گردد.',
      expEn: 'Click Cost column header, choose Equation, select QTY column, enter multiplication symbol *, and select Price custom property.'
    }
  ]
};

// Render function for the SolidWorks Academy inside container
function renderSolidWorksAcademy(containerId) {
  const container = document.getElementById(containerId);
  if (!container || !window.solidworksAcademyData) return;

  const data = window.solidworksAcademyData;
  const isFa = document.documentElement.lang === 'fa';

  let html = `
    <!-- Top Filter Bar & Search Box -->
    <div class="sw-nav-controls">
      <div class="sw-search-box">
        <i data-lucide="search"></i>
        <input type="text" id="swSearchInput" placeholder="${isFa ? 'جستجوی سریع ابزارها، قیود، میانبرها، تمرین‌ها...' : 'Search tools, relations, shortcuts, exercises...'}" oninput="searchSwTools(this.value)">
      </div>
      <div class="sw-tabs-bar" id="swChapterTabs">
        <button class="sw-tab-btn active" onclick="filterSwChapter('all', this)"><i data-lucide="layers"></i> <span>${isFa ? 'همه مباحث و سرفصل‌ها' : 'All Chapters'}</span></button>
        <button class="sw-tab-btn" onclick="filterSwChapter('ch1', this)"><i data-lucide="pen-tool"></i> <span>${isFa ? 'فصل ۱: ترسیم ۲ بعدی' : 'CH 1: 2D Sketch'}</span></button>
        <button class="sw-tab-btn" onclick="filterSwChapter('ch2', this)"><i data-lucide="link-2"></i> <span>${isFa ? 'فصل ۲: قیود و فولی' : 'CH 2: Relations'}</span></button>
        <button class="sw-tab-btn" onclick="filterSwChapter('ch3', this)"><i data-lucide="sliders"></i> <span>${isFa ? 'فصل ۳: نماها و میانبرها' : 'CH 3: Views & Keys'}</span></button>
        <button class="sw-tab-btn" onclick="filterSwChapter('ch4', this)"><i data-lucide="box"></i> <span>${isFa ? 'فصل ۴: مدل‌سازی ۳ بعدی' : 'CH 4: 3D Features'}</span></button>
        <button class="sw-tab-btn" onclick="filterSwChapter('ch5', this)"><i data-lucide="cpu"></i> <span>${isFa ? 'فصل ۵: مونتاژ اسمبلی' : 'CH 5: Assembly'}</span></button>
        <button class="sw-tab-btn" onclick="filterSwChapter('ch6', this)"><i data-lucide="file-text"></i> <span>${isFa ? 'فصل ۶: نقشه‌کشی فنی' : 'CH 6: Drawing'}</span></button>
        <button class="sw-tab-btn" onclick="filterSwChapter('exercises', this)"><i data-lucide="ruler"></i> <span>${isFa ? 'کارگاه نقشه‌ها و تمرین‌ها (۱۰)' : 'Blueprints & Exercises (10)'}</span></button>
        <button class="sw-tab-btn" onclick="filterSwChapter('quiz', this)"><i data-lucide="award"></i> <span>${isFa ? 'آزمون تسلط مهندسی' : 'Knowledge Quiz'}</span></button>
      </div>
    </div>
  `;

  // Render Chapters 1 to 6
  data.chapters.forEach(chap => {
    html += `
      <div class="sw-chapter-section sw-module-card" data-chapter="${chap.id}" id="sw-sec-${chap.id}">
        <div class="sw-module-header">
          <div class="sw-module-title-group">
            <span class="sw-chapter-badge">${isFa ? chap.num : chap.numEn}</span>
            <h3 class="sw-module-title">${isFa ? chap.title : chap.titleEn}</h3>
          </div>
          <span style="font-family: var(--font-mono); font-size: 11px; color: #00f2fe; background: rgba(0, 242, 254, 0.08); padding: 4px 10px; border-radius: 9999px; border: 1px solid rgba(0, 242, 254, 0.2);">${chap.badge}</span>
        </div>
        <div class="sw-module-body">
          <p class="sw-chapter-summary-text" style="font-size: 13px; line-height: 1.6; margin-bottom: 16px;">${isFa ? chap.summary : chap.summaryEn}</p>
          ${chap.content.intro || ''}
          ${chap.content.warning || ''}

          <!-- Tools Grid if available -->
          ${chap.content.tools ? `
            <div style="font-size: 13px; font-weight: 700; color: #38bdf8; margin: 18px 0 10px 0; display: flex; align-items: center; gap: 8px;">
              <i data-lucide="tool" style="width: 14px; height: 14px;"></i>
              <span>${isFa ? 'فهرست ابزارهای تخصصی این محیط:' : 'Workspace Specialized Tools:'}</span>
            </div>
            <div class="sw-tools-grid">
              ${chap.content.tools.map(t => `
                <div class="sw-tool-card">
                  <div class="sw-tool-header">
                    <div>
                      <div class="sw-tool-name-en">${t.name}</div>
                      <div class="sw-tool-name-fa">${t.fa}</div>
                    </div>
                    <div class="sw-tool-icon-wrap"><i data-lucide="${t.icon || 'circle'}" style="width: 16px; height: 16px;"></i></div>
                  </div>
                  <div class="sw-tool-desc">${isFa ? t.desc : (t.descEn || t.desc)}</div>
                  <div class="sw-tool-footer">
                    <span>${isFa ? 'ماژول سالیدورکس' : 'SolidWorks Core'}</span>
                    <i data-lucide="check" style="width: 12px; height: 12px; color: #00f2fe;"></i>
                  </div>
                </div>
              `).join('')}
            </div>
          ` : ''}

          <!-- Color Matrix for Chapter 2 -->
          ${chap.content.colorMatrix ? `
            <div style="font-size: 13px; font-weight: 700; color: #facc15; margin: 20px 0 10px 0; display: flex; align-items: center; gap: 8px;">
              <i data-lucide="palette" style="width: 14px; height: 14px;"></i>
              <span>${isFa ? 'ماتریس کدهای رنگی وضعیت ترسیمات در SolidWorks (نکته امتحانی و صنعتی):' : 'Sketch Color Coding Matrix:'}</span>
            </div>
            <div class="sw-color-matrix">
              ${chap.content.colorMatrix.map(c => `
                <div class="sw-color-badge-card sw-color-${c.color}">
                  <span class="sw-color-pill">${isFa ? c.fa : c.en}</span>
                  <div class="sw-color-desc-text" style="font-size: 11.5px; line-height: 1.5; margin-top: 4px;">${c.desc}</div>
                </div>
              `).join('')}
            </div>
          ` : ''}

          <!-- Relations List for Chapter 2 -->
          ${chap.content.relations ? `
            <div style="font-size: 13px; font-weight: 700; color: #38bdf8; margin: 22px 0 10px 0; display: flex; align-items: center; gap: 8px;">
              <i data-lucide="link" style="width: 14px; height: 14px;"></i>
              <span>${isFa ? 'جعبه ابزار کامل اضافه کردن قیود (Add Relations):' : 'Add Relations Complete Directory:'}</span>
            </div>
            <div class="sw-tools-grid">
              ${chap.content.relations.map(r => `
                <div class="sw-tool-card" style="padding: 12px 14px;">
                  <div class="sw-tool-header" style="margin-bottom: 4px;">
                    <div>
                      <div class="sw-tool-name-en" style="font-size: 12.5px;">${r.name}</div>
                      <div class="sw-tool-name-fa" style="font-size: 12px; color: #38bdf8;">${r.fa}</div>
                    </div>
                    <div class="sw-tool-icon-wrap" style="width: 26px; height: 26px;"><i data-lucide="link" style="width: 13px; height: 13px;"></i></div>
                  </div>
                  <div class="sw-tool-desc" style="font-size: 11px; margin: 4px 0 0 0;">${r.desc}</div>
                </div>
              `).join('')}
            </div>
            ${chap.content.proTip || ''}
          ` : ''}

          <!-- Shortcuts Table for Chapter 3 -->
          ${chap.content.shortcuts ? `
            <div style="font-size: 13px; font-weight: 700; color: #00f2fe; margin: 20px 0 10px 0; display: flex; align-items: center; gap: 8px;">
              <i data-lucide="command" style="width: 14px; height: 14px;"></i>
              <span>${isFa ? 'جدول کامل کلیدهای میانبر استاندارد سالیدورکس:' : 'Standard Keyboard Shortcuts Cheatsheet:'}</span>
            </div>
            <div style="overflow-x: auto;">
              <table class="sw-shortcuts-table">
                <thead>
                  <tr>
                    <th style="width: 180px;">${isFa ? 'کلید میانبر' : 'Shortcut Key'}</th>
                    <th>${isFa ? 'عملکرد تخصصی در نرم‌افزار سالیدورکس' : 'Action in SolidWorks'}</th>
                  </tr>
                </thead>
                <tbody>
                  ${chap.content.shortcuts.map(s => `
                    <tr>
                      <td><span class="sw-kbd">${s.kbd}</span></td>
                      <td>${isFa ? s.fa : s.en}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          ` : ''}

          <!-- End conditions for Chapter 4 -->
          ${chap.content.endConditions ? `
            <div style="font-size: 13px; font-weight: 700; color: #38bdf8; margin: 20px 0 10px 0; display: flex; align-items: center; gap: 8px;">
              <i data-lucide="layers" style="width: 14px; height: 14px;"></i>
              <span>${isFa ? 'روش‌های حجم‌دهی و شرایط پایانی Extruded Boss/Base:' : 'Extruded Boss/Base End Conditions:'}</span>
            </div>
            <div class="sw-tools-grid">
              ${chap.content.endConditions.map(ec => `
                <div class="sw-tool-card" style="padding: 12px 14px;">
                  <div class="sw-tool-header" style="margin-bottom: 4px;">
                    <div>
                      <div class="sw-tool-name-en" style="font-size: 13px;">${ec.name}</div>
                      <div class="sw-tool-name-fa" style="font-size: 12px; color: #38bdf8;">${ec.fa}</div>
                    </div>
                    <div class="sw-tool-icon-wrap" style="width: 26px; height: 26px;"><i data-lucide="arrow-right-circle" style="width: 13px; height: 13px;"></i></div>
                  </div>
                  <div class="sw-tool-desc" style="font-size: 11px; margin: 4px 0 0 0;">${ec.desc}</div>
                </div>
              `).join('')}
            </div>
          ` : ''}

          <!-- Features List for Chapter 4 -->
          ${chap.content.featuresList ? `
            <div style="font-size: 13px; font-weight: 700; color: #00f2fe; margin: 22px 0 10px 0; display: flex; align-items: center; gap: 8px;">
              <i data-lucide="box" style="width: 14px; height: 14px;"></i>
              <span>${isFa ? 'فهرست کامل فیچرهای مدل‌سازی سه‌بعدی و دستورات کمکی:' : '3D Features & Auxiliary Tools Directory:'}</span>
            </div>
            <div class="sw-tools-grid">
              ${chap.content.featuresList.map(f => `
                <div class="sw-tool-card">
                  <div class="sw-tool-header">
                    <div>
                      <div class="sw-tool-name-en">${f.name}</div>
                      <div class="sw-tool-name-fa">${f.fa}</div>
                    </div>
                    <div class="sw-tool-icon-wrap"><i data-lucide="cube" style="width: 16px; height: 16px;"></i></div>
                  </div>
                  <div class="sw-tool-desc">${f.desc}</div>
                </div>
              `).join('')}
            </div>
          ` : ''}

          <!-- Mates for Chapter 5 -->
          ${chap.content.mates ? `
            <div style="font-size: 13px; font-weight: 700; color: #38bdf8; margin: 20px 0 10px 0; display: flex; align-items: center; gap: 8px;">
              <i data-lucide="git-merge" style="width: 14px; height: 14px;"></i>
              <span>${isFa ? 'دسته‌بندی جامع قیود مونتاژ (Mate Options):' : 'Assembly Mates Directory:'}</span>
            </div>
            <div style="display: flex; flex-direction: column; gap: 10px;">
              ${chap.content.mates.map(m => `
                <div class="sw-callout" style="padding: 12px 16px;">
                  <div style="font-family: var(--font-mono); font-size: 12.5px; font-weight: 700; color: #00f2fe; margin-bottom: 6px;">${m.group}</div>
                  <div class="sw-shortcut-desc-text" style="font-size: 12px; line-height: 1.6;">${m.list}</div>
                </div>
              `).join('')}
            </div>
          ` : ''}

          <!-- Drawing views for Chapter 6 -->
          ${chap.content.viewsList ? `
            <div style="font-size: 13px; font-weight: 700; color: #38bdf8; margin: 20px 0 10px 0; display: flex; align-items: center; gap: 8px;">
              <i data-lucide="eye" style="width: 14px; height: 14px;"></i>
              <span>${isFa ? 'انواع نماهای استاندارد مهندسی در محیط Drawing:' : 'Standard Drawing Views Directory:'}</span>
            </div>
            <div class="sw-tools-grid">
              ${chap.content.viewsList.map(v => `
                <div class="sw-tool-card">
                  <div class="sw-tool-header">
                    <div>
                      <div class="sw-tool-name-en">${v.name}</div>
                      <div class="sw-tool-name-fa">${v.fa}</div>
                    </div>
                    <div class="sw-tool-icon-wrap"><i data-lucide="file-plus" style="width: 16px; height: 16px;"></i></div>
                  </div>
                  <div class="sw-tool-desc">${v.desc}</div>
                </div>
              `).join('')}
            </div>
          ` : ''}

          <!-- Detailing tools for Chapter 6 -->
          ${chap.content.detailingTools ? `
            <div style="font-size: 13px; font-weight: 700; color: #00f2fe; margin: 22px 0 10px 0; display: flex; align-items: center; gap: 8px;">
              <i data-lucide="bookmark" style="width: 14px; height: 14px;"></i>
              <span>${isFa ? 'ابزارهای اندازه‌گذاری، تلرانس‌های GD&T و جدول BOM:' : 'Dimensioning, GD&T, and BOM Tables:'}</span>
            </div>
            <div class="sw-tools-grid">
              ${chap.content.detailingTools.map(dt => `
                <div class="sw-tool-card">
                  <div class="sw-tool-header">
                    <div>
                      <div class="sw-tool-name-en">${dt.name}</div>
                      <div class="sw-tool-name-fa">${dt.fa}</div>
                    </div>
                    <div class="sw-tool-icon-wrap"><i data-lucide="tag" style="width: 16px; height: 16px;"></i></div>
                  </div>
                  <div class="sw-tool-desc">${dt.desc}</div>
                </div>
              `).join('')}
            </div>
          ` : ''}

        </div>
      </div>
    `;
  });

  // Render Section 7: Blueprints & Exercises Workshop (۱۰ نقشه صنعتی کارگاهی)
  html += `
    <div class="sw-chapter-section sw-module-card" data-chapter="exercises" id="sw-sec-exercises">
      <div class="sw-module-header">
        <div class="sw-module-title-group">
          <span class="sw-chapter-badge">کارگاه ۱۰ گانه</span>
          <h3 class="sw-module-title">${isFa ? 'کارگاه نقشه‌های صنعتی و تمرین‌های عملی دوره (با کلیه ابعاد و مراحل)' : 'Industrial Blueprints & Hands-on Workshop (Exact Dimensions)'}</h3>
        </div>
        <span style="font-family: var(--font-mono); font-size: 11px; color: #10b981; background: rgba(16, 185, 129, 0.1); padding: 4px 10px; border-radius: 9999px; border: 1px solid rgba(16, 185, 129, 0.3);">۱۰ نقشه ساخت دقیق</span>
      </div>
      <div class="sw-module-body">
        <p class="sw-exercise-intro-text" style="font-size: 13px; line-height: 1.6; margin-bottom: 20px;">
          ${isFa ? 'کلیه تمرین‌ها و نقشه‌های ساخت صنعتی با مشخصات فنی کامل، ابعاد میلی‌متری و گام‌های اجرایی مدلسازی در سالیدورکس (گردآوری و تدوین: محمدامین شریف) در این کارگاه تجمیع شده‌اند.' : 'Complete engineering blueprints with exact millimeter dimensions, technical tolerances, and step-by-step CAD modeling workflows curated by Mohammadamin Sharif.'}
        </p>

        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 20px;">
          ${data.exercises.map((ex, idx) => `
            <div class="sw-exercise-card">
              <div class="sw-exercise-preview" onclick="openBlueprintModal('${ex.image}', '${(isFa ? ex.title : ex.titleEn).replace(/'/g, "\\'")}', '${ex.dims.replace(/'/g, "\\'")}')" style="cursor: pointer;">
                <span class="sw-exercise-badge">${ex.type}</span>
                <img src="${ex.image}" alt="${isFa ? ex.title : ex.titleEn}" class="sw-blueprint-thumb" loading="lazy" />
                <div class="sw-blueprint-hover-overlay">
                  <span class="sw-blueprint-zoom-tag">
                    <i data-lucide="maximize-2" style="width: 14px; height: 14px;"></i>
                    <span>${isFa ? 'بزرگ‌نمایی نقشه' : 'Enlarge Blueprint'}</span>
                  </span>
                </div>
              </div>
              <div class="sw-exercise-body">
                <div>
                  <div class="sw-exercise-item-title" style="font-size: 14.5px; font-weight: 800; margin-bottom: 4px;">${idx + 1}. ${isFa ? ex.title : ex.titleEn}</div>
                  <div class="sw-exercise-item-desc" style="font-size: 11.5px; line-height: 1.5;">${ex.desc}</div>
                  <div class="sw-step-instruction">
                    <div style="font-weight: 700; color: #38bdf8; margin-bottom: 4px; font-size: 11.5px;">${isFa ? 'ابعاد و مشخصات هندسی:' : 'Key Dimensions:'}</div>
                    <div>${ex.dims}</div>
                  </div>
                  <div style="margin-top: 10px;">
                    <div class="sw-exercise-steps-header" style="font-size: 11.5px; font-weight: 700; margin-bottom: 6px;">${isFa ? 'مراحل گام‌به‌گام ترسیم:' : 'Step-by-Step Procedure:'}</div>
                    <ul class="sw-exercise-steps-list" style="font-size: 11px; padding-inline-start: 18px; margin: 0; line-height: 1.6;">
                      ${ex.steps.map(s => `<li>${s}</li>`).join('')}
                    </ul>
                  </div>
                </div>
                <div style="margin-top: 14px; padding-top: 10px; border-top: 1px solid rgba(255, 255, 255, 0.08); display: flex; align-items: center; justify-content: space-between;">
                  <span style="font-family: var(--font-mono); font-size: 10px; color: #64748b;">SOLIDWORKS CERTIFIED</span>
                  <button type="button" onclick="openBlueprintModal('${ex.image}', '${(isFa ? ex.title : ex.titleEn).replace(/'/g, "\\'")}', '${ex.dims.replace(/'/g, "\\'")}')" style="background: rgba(0, 242, 254, 0.1); border: 1px solid rgba(0, 242, 254, 0.35); color: #00f2fe; padding: 4px 10px; border-radius: 6px; font-family: var(--font-mono); font-size: 11px; cursor: pointer; display: flex; align-items: center; gap: 5px; transition: all 0.2s ease;">
                    <i data-lucide="eye" style="width: 12px; height: 12px;"></i>
                    <span>${isFa ? 'مشاهده نقشه کامل' : 'View Blueprint'}</span>
                  </button>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;

  // Render Section 8: Interactive Knowledge Quiz
  html += `
    <div class="sw-chapter-section sw-module-card" data-chapter="quiz" id="sw-sec-quiz">
      <div class="sw-module-header">
        <div class="sw-module-title-group">
          <span class="sw-chapter-badge">ارزیابی آنلاین</span>
          <h3 class="sw-module-title">${isFa ? 'آزمون تعاملی و سنجش تسلط مهندسی سالیدورکس' : 'SolidWorks Interactive Knowledge Assessment Quiz'}</h3>
        </div>
        <div style="display: flex; align-items: center; gap: 10px;">
          <span style="font-family: var(--font-mono); font-size: 12px; color: #00f2fe;" id="swQuizTotalScore">0 / 70</span>
          <button onclick="resetSwQuiz()" style="background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.15); color: #cbd5e1; padding: 4px 10px; border-radius: 6px; font-size: 11px; cursor: pointer;">
            ${isFa ? 'آزمون مجدد' : 'Reset Quiz'}
          </button>
        </div>
      </div>
      <div class="sw-module-body">
        <p class="sw-quiz-intro-text" style="font-size: 13px; line-height: 1.6; margin-bottom: 20px;">
          ${isFa ? 'این آزمون بر اساس مهم‌ترین نکات تحلیلی و صنعتی دوره آموزش سالیدورکس توسط محمدامین شریف طراحی شده است. به سوالات پاسخ دهید و بازخورد تحلیلی دریافت کنید.' : 'Test your mastery of SolidWorks sketches, constraints, 3D features, mates, and drawing detailing curated by Mohammadamin Sharif.'}
        </p>

        <div style="display: flex; flex-direction: column; gap: 20px;">
          ${data.quiz.map((q, qIdx) => `
            <div class="sw-quiz-card" id="sw-q-${q.id}">
              <div class="sw-quiz-question-box">
                <div style="font-family: var(--font-mono); font-size: 11px; color: #00f2fe; margin-bottom: 6px;">QUESTION 0${qIdx + 1}</div>
                <div class="sw-quiz-question-text" style="font-size: 14px; font-weight: 700; line-height: 1.5;">${isFa ? q.qFa : q.qEn}</div>
              </div>
              <div class="sw-quiz-options-list">
                ${(isFa ? q.optionsFa : q.optionsEn).map((opt, optIdx) => `
                  <button class="sw-quiz-option-btn" onclick="answerSwQuiz(${q.id}, ${optIdx}, ${q.correct}, '${q.expFa.replace(/'/g, "\\'")}', '${q.expEn.replace(/'/g, "\\'")}')">
                    <span>${opt}</span>
                  </button>
                `).join('')}
              </div>
              <div class="sw-quiz-explanation sw-callout" id="sw-exp-${q.id}" style="display: none; margin-top: 14px;"></div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;

  container.innerHTML = html;
  try {
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  } catch (e) {
    console.warn('Lucide icon render warning:', e);
  }
}

// Auto-run render when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    renderSolidWorksAcademy('solidworksCourseContainer');
  });
} else {
  renderSolidWorksAcademy('solidworksCourseContainer');
}

// Re-render when language shifts
window.addEventListener('storage', (e) => {
  if (e.key === 'site-lang') {
    renderSolidWorksAcademy('solidworksCourseContainer');
  }
});

// Blueprint Lightbox Modal Handlers with Master CAD Interactive Viewer
let currentBlueprintIndex = 0;
let currentBlueprintZoom = 1;
let currentPanX = 0;
let currentPanY = 0;
let isBlueprintDragging = false;
let blueprintDragStartX = 0;
let blueprintDragStartY = 0;
let blueprintPaperTheme = 'cad'; // 'cad' | 'paper' | 'cyanotype'
let isBlueprintDrawerOpen = false;
let isBlueprintMeasureActive = false;
let caliperPoints = [];

window.openBlueprintModal = function(identifier, fallbackTitle, fallbackDims) {
  let modal = document.getElementById('swBlueprintModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'swBlueprintModal';
    modal.className = 'sw-blueprint-modal';
    document.body.appendChild(modal);
  }

  // Resolve exercise index
  const exercises = (window.solidworksData && window.solidworksData.exercises) ? window.solidworksData.exercises : [];
  let foundIdx = -1;

  if (typeof identifier === 'number') {
    foundIdx = identifier;
  } else if (typeof identifier === 'string') {
    foundIdx = exercises.findIndex(e => e.id === identifier || e.image === identifier || e.title === identifier || e.titleEn === identifier);
  }

  if (foundIdx >= 0) {
    currentBlueprintIndex = foundIdx;
  } else {
    currentBlueprintIndex = 0;
  }

  currentBlueprintZoom = 1;
  currentPanX = 0;
  currentPanY = 0;
  isBlueprintDrawerOpen = false;
  isBlueprintMeasureActive = false;
  caliperPoints = [];

  renderBlueprintModalView();
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';

  // Attach keydown listener for arrows and escape
  window.removeEventListener('keydown', handleBlueprintKeyNav);
  window.addEventListener('keydown', handleBlueprintKeyNav);
};

function renderBlueprintModalView() {
  const modal = document.getElementById('swBlueprintModal');
  if (!modal) return;

  const exercises = (window.solidworksData && window.solidworksData.exercises) ? window.solidworksData.exercises : [];
  const ex = exercises[currentBlueprintIndex] || {
    id: 'ex1',
    type: 'CAD Drawing',
    title: 'نقشه صنعتی مهندسی',
    titleEn: 'Engineering Blueprint',
    image: 'assets/images/blueprints/blueprint-ex1-spider-flange.svg',
    dims: 'ابعاد استاندارد ISO / ASME',
    desc: 'ترسیم و مدلسازی صنعتی',
    steps: []
  };

  const isFa = (localStorage.getItem('site-lang') || 'fa') === 'fa';
  const displayTitle = isFa ? ex.title : ex.titleEn;
  const isFirst = currentBlueprintIndex === 0;
  const isLast = currentBlueprintIndex === exercises.length - 1;

  const themeClass = blueprintPaperTheme === 'paper' ? 'paper-mode' : (blueprintPaperTheme === 'cyanotype' ? 'cyanotype-mode' : '');
  const themeLabels = {
    cad: isFa ? 'بلوپرینت تیره' : 'Dark CAD',
    paper: isFa ? 'کاغذ پلاتر سفید' : 'White Plotter',
    cyanotype: isFa ? 'سیانوتیپ کلاسیک' : 'Cyanotype'
  };

  modal.innerHTML = `
    <div class="sw-bp-backdrop" onclick="closeBlueprintModal()"></div>
    <div class="sw-bp-dialog" id="swBpModalDialog" role="dialog" aria-modal="true">
      
      <!-- Top CAD Header -->
      <div class="sw-bp-header">
        <div class="sw-bp-header-left">
          <div class="sw-bp-icon-badge">
            <i data-lucide="compass" style="width: 20px; height: 20px;"></i>
          </div>
          <div style="flex: 1; min-width: 0;">
            <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
              <span style="background: rgba(0, 242, 254, 0.15); border: 1px solid rgba(0, 242, 254, 0.35); color: #00f2fe; padding: 2px 7px; border-radius: 4px; font-family: var(--font-mono); font-size: 10px; font-weight: 700;">${ex.type}</span>
              <h4 class="sw-bp-title" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 320px;">${currentBlueprintIndex + 1}. ${displayTitle}</h4>
            </div>
            <div class="sw-bp-subtitle" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 440px;">${ex.dims || ''}</div>
          </div>
        </div>

        <!-- Quick Switcher Selector between Blueprints -->
        <div class="sw-bp-nav-strip">
          <button type="button" class="sw-bp-nav-btn" onclick="navigateBlueprint(-1)" ${isFirst ? 'disabled' : ''} title="${isFa ? 'نقشه قبلی (کلید جهت چپ)' : 'Previous Blueprint (Left Arrow)'}">
            <i data-lucide="chevron-right" style="width: 16px; height: 16px;"></i>
          </button>
          
          <select class="sw-bp-nav-select" onchange="navigateBlueprintTo(this.value)" aria-label="Select Blueprint">
            ${exercises.map((item, idx) => `
              <option value="${idx}" ${idx === currentBlueprintIndex ? 'selected' : ''}>
                ${idx + 1}. ${isFa ? item.title : item.titleEn}
              </option>
            `).join('')}
          </select>

          <button type="button" class="sw-bp-nav-btn" onclick="navigateBlueprint(1)" ${isLast ? 'disabled' : ''} title="${isFa ? 'نقشه بعدی (کلید جهت راست)' : 'Next Blueprint (Right Arrow)'}">
            <i data-lucide="chevron-left" style="width: 16px; height: 16px;"></i>
          </button>
        </div>
        
        <!-- Interactive Controls Toolbar -->
        <div class="sw-bp-toolbar">
          <!-- Cycle 3 CAD Paper Themes (Dark / White Plotter / Cyanotype) -->
          <button type="button" class="sw-bp-tool-btn" id="swBpThemeCycle" onclick="cycleBlueprintPaperTheme()" title="${isFa ? 'تغییر پوسته نقشه (بلوپرینت تیره / پلاتر سفید / سیانوتیپ)' : 'Cycle CAD Paper Modes'}">
            <i data-lucide="palette" style="width: 14px; height: 14px;"></i>
            <span id="swBpThemeLabel">${themeLabels[blueprintPaperTheme]}</span>
          </button>

          <!-- Interactive Caliper Measurement Tool -->
          <button type="button" class="sw-bp-tool-btn ${isBlueprintMeasureActive ? 'active' : ''}" id="swBpMeasureBtn" onclick="toggleBlueprintMeasure()" title="${isFa ? 'کولیس اندازه‌گیری دقیق ابعاد (کلیک روی دو نقطه)' : 'Precision Caliper Ruler'}">
            <i data-lucide="ruler" style="width: 14px; height: 14px;"></i>
            <span>${isFa ? 'کولیس مهندسی' : 'Caliper'}</span>
          </button>

          <!-- Toggle Modeling Steps & Specs Drawer -->
          <button type="button" class="sw-bp-tool-btn ${isBlueprintDrawerOpen ? 'active' : ''}" id="swBpDrawerBtn" onclick="toggleBlueprintDrawer()" title="${isFa ? 'مشاهده مراحل مدلسازی و مشخصات فنی' : 'View Modeling Steps & Specs'}">
            <i data-lucide="list-checks" style="width: 14px; height: 14px;"></i>
            <span>${isFa ? 'راهنمای مدل‌سازی' : 'Specs & Guide'}</span>
          </button>

          <!-- Zoom Controls -->
          <button type="button" class="sw-bp-tool-btn" onclick="zoomBlueprint(0.25)" title="${isFa ? 'بزرگ‌نمایی (+)' : 'Zoom In (+)'}">
            <i data-lucide="zoom-in" style="width: 14px; height: 14px;"></i>
          </button>
          <button type="button" class="sw-bp-tool-btn" onclick="zoomBlueprint(-0.25)" title="${isFa ? 'کوچک‌نمایی (-)' : 'Zoom Out (-)'}">
            <i data-lucide="zoom-out" style="width: 14px; height: 14px;"></i>
          </button>
          <button type="button" class="sw-bp-tool-btn" onclick="resetBlueprintZoom()" title="${isFa ? 'اندازه پیش‌فرض ۱۰۰٪ (دوبار کلیک)' : 'Reset 100%'}">
            <i data-lucide="rotate-ccw" style="width: 14px; height: 14px;"></i>
            <span id="swBpZoomValue">${Math.round(currentBlueprintZoom * 100)}%</span>
          </button>

          <!-- Fullscreen Toggle -->
          <button type="button" class="sw-bp-tool-btn" onclick="toggleBlueprintFullscreen()" title="${isFa ? 'تمام‌صفحه' : 'Toggle Fullscreen'}">
            <i data-lucide="maximize" style="width: 14px; height: 14px;"></i>
          </button>

          <!-- Print High-Res Vector Blueprint -->
          <button type="button" class="sw-bp-tool-btn" onclick="printCurrentBlueprint()" title="${isFa ? 'چاپ نقشه استاندارد مهندسی' : 'Print High-Res Blueprint'}">
            <i data-lucide="printer" style="width: 14px; height: 14px;"></i>
          </button>

          <!-- Download Vector SVG -->
          <a href="${ex.image}" download="${ex.id}-blueprint.svg" class="sw-bp-download-btn" title="${isFa ? 'دانلود مستقیم فایل وکتور SVG' : 'Download Vector SVG'}">
            <i data-lucide="download" style="width: 16px; height: 16px;"></i>
          </a>

          <!-- Close Button -->
          <button type="button" class="sw-bp-close-btn" onclick="closeBlueprintModal()" aria-label="Close">
            <i data-lucide="x" style="width: 18px; height: 18px;"></i>
          </button>
        </div>
      </div>

      <!-- Main CAD Viewport with Pan, Zoom & Real-time Coordinate HUD -->
      <div class="sw-bp-view-container ${themeClass}" id="swBpContainer">
        <!-- Live Coordinate & Scale HUD -->
        <div class="sw-bp-hud" id="swBpHud">
          <div class="sw-bp-hud-item"><span class="sw-bp-hud-label">CAD</span> <span class="sw-bp-hud-val" id="swBpHudCoord">X: 0.0 mm | Y: 0.0 mm</span></div>
          <div class="sw-bp-hud-item"><span class="sw-bp-hud-label">SCALE</span> <span class="sw-bp-hud-val" id="swBpHudScale">${Math.round(currentBlueprintZoom * 100)}% (1:1)</span></div>
          <div class="sw-bp-hud-item" id="swBpHudMeasureItem" style="display: ${isBlueprintMeasureActive ? 'flex' : 'none'};"><span class="sw-bp-hud-label" style="color: #f59e0b;">MEASURE</span> <span class="sw-bp-hud-val" id="swBpHudMeasureVal" style="color: #f59e0b;">${isFa ? 'روی ۲ نقطه کلیک کنید' : 'Click 2 points'}</span></div>
        </div>

        <canvas class="sw-bp-caliper-canvas" id="swBpCaliperCanvas"></canvas>
        <img 
          src="${ex.image}" 
          alt="${displayTitle}" 
          class="sw-bp-modal-img" 
          id="swBpImg"
          ondragstart="return false;"
        />
      </div>

      <!-- Collapsible Modeling Guide & Technical Specs Drawer -->
      <div class="sw-bp-drawer ${isBlueprintDrawerOpen ? 'open' : ''}" id="swBpDrawer">
        <div class="sw-bp-drawer-grid">
          <div>
            <div class="sw-bp-drawer-title">
              <i data-lucide="layers" style="width: 16px; height: 16px;"></i>
              <span>${isFa ? 'شناسنامه و مشخصات قطعه' : 'Part Specifications'}</span>
            </div>
            <div class="sw-bp-info-box">
              <div class="sw-bp-info-row">
                <span class="sw-bp-info-label">${isFa ? 'کد نقشه:' : 'Drawing No:'}</span>
                <span class="sw-bp-info-value">MAS-SW-EX0${currentBlueprintIndex + 1}-REV.B</span>
              </div>
              <div class="sw-bp-info-row">
                <span class="sw-bp-info-label">${isFa ? 'محیط کاری سالیدورکز:' : 'SolidWorks Module:'}</span>
                <span class="sw-bp-info-value" style="color: #00f2fe;">${ex.type}</span>
              </div>
              <div class="sw-bp-info-row">
                <span class="sw-bp-info-label">${isFa ? 'سیستم استاندارد:' : 'Standard:'}</span>
                <span class="sw-bp-info-value">ISO 7200 / ASME Y14.5M</span>
              </div>
              <div class="sw-bp-info-row">
                <span class="sw-bp-info-label">${isFa ? 'تلرانس عمومی:' : 'General Tolerance:'}</span>
                <span class="sw-bp-info-value">ISO 2768-m (±0.1 mm)</span>
              </div>
              <div class="sw-bp-info-row">
                <span class="sw-bp-info-label">${isFa ? 'زاویه دید:' : 'Projection:'}</span>
                <span class="sw-bp-info-value">${isFa ? 'فرجه سوم (Third Angle)' : 'Third Angle (USA/CAD)'}</span>
              </div>
            </div>
          </div>
          <div>
            <div class="sw-bp-drawer-title">
              <i data-lucide="check-circle-2" style="width: 16px; height: 16px;"></i>
              <span>${isFa ? 'مراحل گام‌به‌گام مدلسازی در سالیدورکز' : 'SolidWorks Step-by-Step Instructions'}</span>
            </div>
            <ul class="sw-bp-steps-list">
              ${(ex.steps && ex.steps.length > 0) 
                ? ex.steps.map(step => `<li>${step}</li>`).join('') 
                : `<li>${isFa ? 'نقشه را با قیدهای هندسی کامل (Fully Defined) ترسیم کنید.' : 'Create fully constrained 2D sketch/3D model.'}</li>`
              }
            </ul>
          </div>
        </div>
      </div>

      <!-- Bottom Status & Hints Footer -->
      <div class="sw-bp-footer">
        <div class="sw-bp-watermark">
          <span class="sw-bp-watermark-tag">ISO 7200 / ASME Y14.5M</span>
          <span style="display: inline-block;">${isFa ? 'گردآوری و تدوین: محمدامین شریف | آکادمی تخصصی سالیدورکز' : 'Curated by Mohammadamin Sharif | SolidWorks CAD Academy'}</span>
        </div>
        <div style="display: flex; align-items: center; gap: 10px;">
          <span style="font-family: var(--font-mono); font-size: 11px; color: #64748b; display: none; @media(min-width: 600px){display: inline;}">
            ${isFa ? 'راهنما: درگ برای جابجایی | اسکرول برای زوم | دو کلیک برای بازنشانی' : 'Drag to pan | Scroll to zoom | Double click to reset'}
          </span>
          <button type="button" class="sw-bp-action-btn" onclick="closeBlueprintModal()">${isFa ? 'بستن پنجره' : 'Close'}</button>
        </div>
      </div>
    </div>
  `;

  // Attach interactive pan & zoom events
  initBlueprintPanAndZoom();

  try {
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  } catch (e) {
    console.warn(e);
  }
}

function handleBlueprintKeyNav(e) {
  const modal = document.getElementById('swBlueprintModal');
  if (!modal || !modal.classList.contains('active')) return;

  if (e.key === 'Escape') {
    closeBlueprintModal();
  } else if (e.key === 'ArrowRight') {
    navigateBlueprint(1);
  } else if (e.key === 'ArrowLeft') {
    navigateBlueprint(-1);
  }
}

window.navigateBlueprint = function(dir) {
  const exercises = (window.solidworksData && window.solidworksData.exercises) ? window.solidworksData.exercises : [];
  const nextIdx = currentBlueprintIndex + dir;
  if (nextIdx >= 0 && nextIdx < exercises.length) {
    currentBlueprintIndex = nextIdx;
    currentBlueprintZoom = 1;
    currentPanX = 0;
    currentPanY = 0;
    caliperPoints = [];
    renderBlueprintModalView();
  }
};

window.navigateBlueprintTo = function(idx) {
  const target = parseInt(idx, 10);
  if (!isNaN(target)) {
    currentBlueprintIndex = target;
    currentBlueprintZoom = 1;
    currentPanX = 0;
    currentPanY = 0;
    caliperPoints = [];
    renderBlueprintModalView();
  }
};

window.cycleBlueprintPaperTheme = function() {
  const themes = ['cad', 'paper', 'cyanotype'];
  const curIdx = themes.indexOf(blueprintPaperTheme);
  blueprintPaperTheme = themes[(curIdx + 1) % themes.length];
  
  const container = document.getElementById('swBpContainer');
  const label = document.getElementById('swBpThemeLabel');
  const isFa = (localStorage.getItem('site-lang') || 'fa') === 'fa';
  
  const themeLabels = {
    cad: isFa ? 'بلوپرینت تیره' : 'Dark CAD',
    paper: isFa ? 'کاغذ پلاتر سفید' : 'White Plotter',
    cyanotype: isFa ? 'سیانوتیپ کلاسیک' : 'Cyanotype'
  };

  if (container) {
    container.classList.remove('paper-mode', 'cyanotype-mode');
    if (blueprintPaperTheme === 'paper') container.classList.add('paper-mode');
    if (blueprintPaperTheme === 'cyanotype') container.classList.add('cyanotype-mode');
  }
  if (label) {
    label.textContent = themeLabels[blueprintPaperTheme];
  }
};

window.toggleBlueprintMeasure = function() {
  isBlueprintMeasureActive = !isBlueprintMeasureActive;
  caliperPoints = [];
  const btn = document.getElementById('swBpMeasureBtn');
  const item = document.getElementById('swBpHudMeasureItem');
  const isFa = (localStorage.getItem('site-lang') || 'fa') === 'fa';
  
  if (btn) btn.classList.toggle('active', isBlueprintMeasureActive);
  if (item) item.style.display = isBlueprintMeasureActive ? 'flex' : 'none';
  
  const val = document.getElementById('swBpHudMeasureVal');
  if (val) val.textContent = isFa ? 'روی ۲ نقطه کلیک کنید' : 'Click 2 points';
  
  clearCaliperCanvas();
};

function clearCaliperCanvas() {
  const canvas = document.getElementById('swBpCaliperCanvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
}

window.toggleBlueprintDrawer = function() {
  isBlueprintDrawerOpen = !isBlueprintDrawerOpen;
  const drawer = document.getElementById('swBpDrawer');
  const btn = document.getElementById('swBpDrawerBtn');
  if (drawer) {
    drawer.classList.toggle('open', isBlueprintDrawerOpen);
  }
  if (btn) {
    btn.classList.toggle('active', isBlueprintDrawerOpen);
  }
};

window.toggleBlueprintFullscreen = function() {
  const dialog = document.getElementById('swBpModalDialog');
  if (!dialog) return;

  if (!document.fullscreenElement) {
    if (dialog.requestFullscreen) {
      dialog.requestFullscreen().catch(() => {
        dialog.classList.toggle('fullscreen');
      });
    } else {
      dialog.classList.toggle('fullscreen');
    }
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    }
    dialog.classList.remove('fullscreen');
  }
};

window.printCurrentBlueprint = function() {
  window.print();
};

window.zoomBlueprint = function(delta) {
  currentBlueprintZoom = Math.min(Math.max(0.5, currentBlueprintZoom + delta), 3.5);
  applyBlueprintTransform();
};

window.resetBlueprintZoom = function() {
  currentBlueprintZoom = 1;
  currentPanX = 0;
  currentPanY = 0;
  applyBlueprintTransform();
};

function applyBlueprintTransform() {
  const img = document.getElementById('swBpImg');
  const val = document.getElementById('swBpZoomValue');
  const hudScale = document.getElementById('swBpHudScale');
  if (img) {
    img.style.transform = `translate(${currentPanX}px, ${currentPanY}px) scale(${currentBlueprintZoom})`;
  }
  if (val) {
    val.textContent = `${Math.round(currentBlueprintZoom * 100)}%`;
  }
  if (hudScale) {
    hudScale.textContent = `${Math.round(currentBlueprintZoom * 100)}% (1:1)`;
  }
}

function initBlueprintPanAndZoom() {
  const container = document.getElementById('swBpContainer');
  const img = document.getElementById('swBpImg');
  const hudCoord = document.getElementById('swBpHudCoord');
  const canvas = document.getElementById('swBpCaliperCanvas');
  if (!container || !img) return;

  if (canvas) {
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
  }

  // Track cursor position for millimeter CAD readout
  container.onmousemove = function(e) {
    const rect = img.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      const relX = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
      const relY = Math.max(0, Math.min(rect.height, e.clientY - rect.top));
      // Standard ISO sheet 840 x 580 mm
      const mmX = ((relX / rect.width) * 840).toFixed(1);
      const mmY = ((relY / rect.height) * 580).toFixed(1);
      if (hudCoord) {
        hudCoord.textContent = `X: ${mmX} mm | Y: ${mmY} mm`;
      }
    }

    if (isBlueprintDragging) {
      currentPanX = e.clientX - blueprintDragStartX;
      currentPanY = e.clientY - blueprintDragStartY;
      applyBlueprintTransform();
    }
  };

  // Mouse Wheel Zoom
  container.onwheel = function(e) {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.2 : -0.2;
    currentBlueprintZoom = Math.min(Math.max(0.5, currentBlueprintZoom + delta), 3.5);
    applyBlueprintTransform();
  };

  // Double click to reset
  container.ondblclick = function() {
    resetBlueprintZoom();
  };

  // Click handler for caliper measurement tool
  container.onclick = function(e) {
    if (!isBlueprintMeasureActive) return;
    const rect = img.getBoundingClientRect();
    const isFa = (localStorage.getItem('site-lang') || 'fa') === 'fa';
    if (rect.width > 0 && rect.height > 0) {
      const relX = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
      const relY = Math.max(0, Math.min(rect.height, e.clientY - rect.top));
      const mmX = (relX / rect.width) * 840;
      const mmY = (relY / rect.height) * 580;

      caliperPoints.push({ x: e.clientX, y: e.clientY, mmX, mmY });

      if (caliperPoints.length === 1) {
        const val = document.getElementById('swBpHudMeasureVal');
        if (val) val.textContent = isFa ? 'نقطه دوم را کلیک کنید' : 'Click second point';
      } else if (caliperPoints.length >= 2) {
        const p1 = caliperPoints[0];
        const p2 = caliperPoints[1];
        const distMm = Math.hypot(p2.mmX - p1.mmX, p2.mmY - p1.mmY).toFixed(1);
        const val = document.getElementById('swBpHudMeasureVal');
        if (val) val.textContent = `Δ: ${distMm} mm (ΔX: ${Math.abs(p2.mmX - p1.mmX).toFixed(1)}, ΔY: ${Math.abs(p2.mmY - p1.mmY).toFixed(1)})`;
        
        // Draw dimension line on canvas
        if (canvas) {
          const ctx = canvas.getContext('2d');
          const cRect = canvas.getBoundingClientRect();
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.strokeStyle = '#f59e0b';
          ctx.fillStyle = '#f59e0b';
          ctx.lineWidth = 2;
          ctx.setLineDash([4, 4]);

          const x1 = p1.x - cRect.left;
          const y1 = p1.y - cRect.top;
          const x2 = p2.x - cRect.left;
          const y2 = p2.y - cRect.top;

          ctx.beginPath();
          ctx.arc(x1, y1, 5, 0, Math.PI * 2);
          ctx.arc(x2, y2, 5, 0, Math.PI * 2);
          ctx.fill();

          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();

          ctx.setLineDash([]);
          ctx.font = 'bold 12px monospace';
          const midX = (x1 + x2) / 2;
          const midY = (y1 + y2) / 2 - 8;
          ctx.fillText(`${distMm} mm`, midX, midY);
        }

        caliperPoints = []; // reset for next measurement
      }
    }
  };

  // Mouse Drag to Pan
  container.onmousedown = function(e) {
    if (isBlueprintMeasureActive) return;
    if (e.button !== 0) return;
    isBlueprintDragging = true;
    blueprintDragStartX = e.clientX - currentPanX;
    blueprintDragStartY = e.clientY - currentPanY;
    img.style.cursor = 'grabbing';
  };

  window.onmouseup = function() {
    if (isBlueprintDragging) {
      isBlueprintDragging = false;
      if (img) img.style.cursor = isBlueprintMeasureActive ? 'crosshair' : 'grab';
    }
  };

  // Touch Support (Mobile / Tablet)
  let initialTouchDist = 0;
  container.ontouchstart = function(e) {
    if (e.touches.length === 1) {
      isBlueprintDragging = true;
      blueprintDragStartX = e.touches[0].clientX - currentPanX;
      blueprintDragStartY = e.touches[0].clientY - currentPanY;
    } else if (e.touches.length === 2) {
      isBlueprintDragging = false;
      initialTouchDist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
    }
  };

  container.ontouchmove = function(e) {
    if (isBlueprintDragging && e.touches.length === 1) {
      e.preventDefault();
      currentPanX = e.touches[0].clientX - blueprintDragStartX;
      currentPanY = e.touches[0].clientY - blueprintDragStartY;
      applyBlueprintTransform();
    } else if (e.touches.length === 2) {
      e.preventDefault();
      const currentDist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      if (initialTouchDist > 0) {
        const factor = currentDist / initialTouchDist;
        currentBlueprintZoom = Math.min(Math.max(0.5, currentBlueprintZoom * factor), 3.5);
        applyBlueprintTransform();
        initialTouchDist = currentDist;
      }
    }
  };

  container.ontouchend = function() {
    isBlueprintDragging = false;
    initialTouchDist = 0;
  };
}

window.closeBlueprintModal = function() {
  const modal = document.getElementById('swBlueprintModal');
  if (modal) {
    modal.classList.remove('active');
  }
  document.body.style.overflow = '';
  window.removeEventListener('keydown', handleBlueprintKeyNav);
};

