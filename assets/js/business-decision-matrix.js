/**
 * Interactive Weighted Decision Matrix (Pugh Matrix)
 * ابزار تعاملی ماتریس تصمیم‌گیری وزنی برای تصمیم‌های مهندسی و کسب‌وکار
 * Author: Mohammadamin Sharif • IUST
 */

(function () {
  'use strict';

  const PRESETS = {
    business: {
      id: 'business',
      titleFa: 'انتخاب ایده کسب‌وکار مهندسی',
      titleEn: 'Engineering Business Idea Selection',
      descFa: 'مقایسه سه سناریوی واقعی برای یک دانشجوی مهندسی مکانیک جهت شروع فعالیت تجاری',
      descEn: 'Comparing 3 realistic commercial scenarios for an engineering graduate to launch a business',
      options: [
        { id: 'opt1', nameFa: 'کارگاه قطعات CNC', nameEn: 'CNC Machine Shop', badgeFa: 'تولیدی', badgeEn: 'Manufacturing', color: '#0ea5e9' },
        { id: 'opt2', nameFa: 'خدمات فریلنسری CAD', nameEn: 'Freelance CAD & Sim', badgeFa: 'خدماتی', badgeEn: 'Services', color: '#10b981' },
        { id: 'opt3', nameFa: 'استارتاپ چاپ ۳D', nameEn: '3D Printing Startup', badgeFa: 'نوآورانه', badgeEn: 'Innovative', color: '#f59e0b' }
      ],
      criteria: [
        { id: 'c1', nameFa: 'سرمایه اولیه اندک', nameEn: 'Low Initial Capital', weight: 5, scores: { opt1: 2, opt2: 5, opt3: 3 } },
        { id: 'c2', nameFa: 'اندازه بازار و تقاضا', nameEn: 'Market Size & Demand', weight: 4, scores: { opt1: 4, opt2: 3, opt3: 5 } },
        { id: 'c3', nameFa: 'تناسب با مهارت فعلی', nameEn: 'Current Tech & Skill Fit', weight: 4, scores: { opt1: 5, opt2: 4, opt3: 3 } },
        { id: 'c4', nameFa: 'ریسک مالی پایین', nameEn: 'Low Financial Risk', weight: 3, scores: { opt1: 3, opt2: 5, opt3: 2 } },
        { id: 'c5', nameFa: 'سرعت رسیدن به اولین درآمد', nameEn: 'Speed to First Revenue', weight: 4, scores: { opt1: 2, opt2: 5, opt3: 3 } }
      ]
    },
    career: {
      id: 'career',
      titleFa: 'انتخاب مسیر شغلی و پروژه‌ای',
      titleEn: 'Career & Project Path Selection',
      descFa: 'تصمیم‌گیری بین سه موقعیت شغلی متناقض پس از فارغ‌التحصیلی یا حین تحصیل',
      descEn: 'Decision making between 3 contrasting career directions during or after graduation',
      options: [
        { id: 'opt1', nameFa: 'استارتاپ صنعتی پویا', nameEn: 'Hardware Startup', badgeFa: 'چالش‌محور', badgeEn: 'High-Impact', color: '#ef4444' },
        { id: 'opt2', nameFa: 'شرکت بزرگ EPC / نفت', nameEn: 'Enterprise Energy Corp', badgeFa: 'باثبات', badgeEn: 'Stable', color: '#38bdf8' },
        { id: 'opt3', nameFa: 'ادامه تحصیل ارشد و ریسرچ', nameEn: 'Graduate Research (MS)', badgeFa: 'آکادمیک', badgeEn: 'Academic', color: '#8b5cf6' }
      ],
      criteria: [
        { id: 'c1', nameFa: 'سرعت رشد مهارت‌های تخصصی', nameEn: 'Skill Acquisition Rate', weight: 5, scores: { opt1: 5, opt2: 3, opt3: 4 } },
        { id: 'c2', nameFa: 'امنیت مالی و درآمد ماهانه', nameEn: 'Monthly Financial Stability', weight: 4, scores: { opt1: 2, opt2: 5, opt3: 2 } },
        { id: 'c3', nameFa: 'استقلال و آزادی عمل فردی', nameEn: 'Autonomy & Influence', weight: 4, scores: { opt1: 5, opt2: 2, opt3: 4 } },
        { id: 'c4', nameFa: 'تعادل کار و آرامش زندگی', nameEn: 'Work-Life Balance', weight: 3, scores: { opt1: 2, opt2: 4, opt3: 3 } },
        { id: 'c5', nameFa: 'اعتبار رزومه برای ۵ سال آینده', nameEn: '5-Year Resume Value', weight: 4, scores: { opt1: 4, opt2: 4, opt3: 5 } }
      ]
    },
    equipment: {
      id: 'equipment',
      titleFa: 'انتخاب تجهیزات و ماشین‌آلات کارگاهی',
      titleEn: 'Workshop Machinery Selection',
      descFa: 'انتخاب بین خرید پرینتر رزینی دقیق، پرینتر فیلامنتی اقتصادی یا فرز CNC رومیزی',
      descEn: 'Choosing between Precision Resin 3D, Affordable FDM 3D, or Desktop CNC Mill',
      options: [
        { id: 'opt1', nameFa: 'پرینتر ۳D رزینی (SLA)', nameEn: 'Resin SLA 3D Printer', badgeFa: 'دقت بالا', badgeEn: 'High Precision', color: '#06b6d4' },
        { id: 'opt2', nameFa: 'پرینتر ۳D فیلامنتی (FDM)', nameEn: 'Filament FDM 3D Printer', badgeFa: 'اقتصادی', badgeEn: 'Economical', color: '#10b981' },
        { id: 'opt3', nameFa: 'فرز CNC رومیزی فلزات', nameEn: 'Desktop CNC Mill', badgeFa: 'قطعات فلزی', badgeEn: 'Machining', color: '#f59e0b' }
      ],
      criteria: [
        { id: 'c1', nameFa: 'دقت ابعادی و صافی سطح قطعه', nameEn: 'Dimensional Precision', weight: 5, scores: { opt1: 5, opt2: 3, opt3: 4 } },
        { id: 'c2', nameFa: 'هزینه نگهداری و مواد اولیه', nameEn: 'Operating & Material Cost', weight: 4, scores: { opt1: 2, opt2: 5, opt3: 3 } },
        { id: 'c3', nameFa: 'استحکام مکانیکی قطعه نهایی', nameEn: 'Mechanical Part Strength', weight: 4, scores: { opt1: 3, opt2: 4, opt3: 5 } },
        { id: 'c4', nameFa: 'سرعت و راحتی کاربری', nameEn: 'Workflow Speed & Ease', weight: 3, scores: { opt1: 3, opt2: 5, opt3: 2 } },
        { id: 'c5', nameFa: 'تنوع متریال‌های قابل پردازش', nameEn: 'Material Versatility', weight: 4, scores: { opt1: 3, opt2: 4, opt3: 5 } }
      ]
    }
  };

  class BusinessDecisionMatrix {
    constructor(containerId, initialPreset = 'business') {
      this.container = document.getElementById(containerId);
      if (!this.container) return;

      this.currentPresetKey = initialPreset;
      this.state = JSON.parse(JSON.stringify(PRESETS[initialPreset]));
      this.lang = document.documentElement.getAttribute('lang') || 'fa';

      this.render();
      this.bindEvents();
    }

    setPreset(presetKey) {
      if (!PRESETS[presetKey]) return;
      this.currentPresetKey = presetKey;
      this.state = JSON.parse(JSON.stringify(PRESETS[presetKey]));
      this.render();
    }

    calculateTotals() {
      const totals = {};
      let maxPossible = 0;

      // Initialize totals
      this.state.options.forEach(opt => {
        totals[opt.id] = 0;
      });

      this.state.criteria.forEach(crit => {
        const w = Number(crit.weight) || 1;
        maxPossible += w * 5;

        this.state.options.forEach(opt => {
          const score = Number(crit.scores[opt.id]) || 0;
          totals[opt.id] += w * score;
        });
      });

      // Rank options
      const ranked = this.state.options.map(opt => {
        const score = totals[opt.id];
        const pct = maxPossible > 0 ? Math.round((score / maxPossible) * 100) : 0;
        return {
          id: opt.id,
          name: this.lang === 'fa' ? opt.nameFa : opt.nameEn,
          badge: this.lang === 'fa' ? opt.badgeFa : opt.badgeEn,
          color: opt.color,
          score,
          pct
        };
      }).sort((a, b) => b.score - a.score);

      const winner = ranked[0];
      const runnerUp = ranked[1] || null;
      const pointGap = runnerUp ? winner.score - runnerUp.score : 0;
      const pctLead = runnerUp && runnerUp.score > 0 ? ((pointGap / runnerUp.score) * 100).toFixed(1) : 0;

      return { totals, maxPossible, ranked, winner, runnerUp, pointGap, pctLead };
    }

    render() {
      if (!this.container) return;
      const isFa = this.lang === 'fa';
      const results = this.calculateTotals();
      const currentPreset = this.state;

      this.container.innerHTML = `
        <div class="pdm-wrapper">
          <!-- TOOL HEADER & PRESETS -->
          <div class="pdm-header-row">
            <div>
              <div class="pdm-tool-badge">
                <i data-lucide="cpu" style="width: 14px; height: 14px;"></i>
                <span>${isFa ? 'ابزار تعاملی مهندسی مدیریت' : 'Engineering Management Interactive Tool'}</span>
              </div>
              <h3 class="pdm-title">
                ${isFa ? 'ماتریس تصمیم‌گیری وزنی پویا (Pugh Matrix)' : 'Dynamic Weighted Decision Matrix (Pugh Matrix)'}
              </h3>
              <p class="pdm-desc">
                ${isFa ? 'معیارها را بسنجید، به هر فاکتور وزن بدهید و بر اساس فرمول محاسباتی \\( \\sum (W_i \\times S_{ij}) \\) گزینه بهینه را تعیین کنید.' : 'Assign weights to criteria, score alternatives, and compute optimal choice via \\( \\sum (W_i \\times S_{ij}) \\).'}
              </p>
            </div>

            <!-- PRESET BUTTONS -->
            <div class="pdm-presets-nav" role="tablist">
              <span class="pdm-presets-label">${isFa ? 'سناریوهای آماده:' : 'Presets:'}</span>
              <button type="button" class="pdm-preset-btn ${this.currentPresetKey === 'business' ? 'active' : ''}" data-preset="business">
                <i data-lucide="briefcase" style="width: 13px; height: 13px;"></i>
                <span>${isFa ? 'ایده‌های کسب‌وکار' : 'Business Ideas'}</span>
              </button>
              <button type="button" class="pdm-preset-btn ${this.currentPresetKey === 'career' ? 'active' : ''}" data-preset="career">
                <i data-lucide="compass" style="width: 13px; height: 13px;"></i>
                <span>${isFa ? 'مسیر شغلی مهندسی' : 'Career Paths'}</span>
              </button>
              <button type="button" class="pdm-preset-btn ${this.currentPresetKey === 'equipment' ? 'active' : ''}" data-preset="equipment">
                <i data-lucide="wrench" style="width: 13px; height: 13px;"></i>
                <span>${isFa ? 'خرید تجهیزات کارگاه' : 'Equipment'}</span>
              </button>
            </div>
          </div>

          <!-- WINNER SPOTLIGHT BANNER -->
          <div class="pdm-winner-banner">
            <div class="pdm-winner-icon">
              <i data-lucide="trophy" style="width: 28px; height: 28px; color: #10b981;"></i>
            </div>
            <div class="pdm-winner-content">
              <div class="pdm-winner-tag">
                ${isFa ? '🏆 گزینه برنده از نظر محاسبات مهندسی' : '🏆 Mathematically Recommended Choice'}
              </div>
              <div class="pdm-winner-name">
                ${results.winner.name}
                <span class="pdm-winner-score-badge">${results.winner.score} ${isFa ? 'امتیاز' : 'pts'} (${results.winner.pct}٪)</span>
              </div>
              <div class="pdm-winner-analysis">
                ${isFa 
                  ? `این گزینه با اختلاف <strong>${results.pointGap} امتیاز</strong> (${results.pctLead}٪ برتری) نسبت به رتبه دوم (<em>${results.runnerUp ? results.runnerUp.name : ''}</em>) در جایگاه نخست قرار گرفت.`
                  : `Leads by <strong>${results.pointGap} points</strong> (${results.pctLead}% advantage) ahead of runner-up (<em>${results.runnerUp ? results.runnerUp.name : ''}</em>).`
                }
              </div>
            </div>
          </div>

          <!-- COMPARATIVE RANKING BARS -->
          <div class="pdm-ranking-panel">
            <div class="pdm-panel-subhead">
              <i data-lucide="bar-chart-3" style="width: 15px; height: 15px;"></i>
              <span>${isFa ? 'مقایسه تصویری امتیاز گزینه‌ها' : 'Comparative Option Scores'}</span>
            </div>
            <div class="pdm-bars-list">
              ${results.ranked.map((item, idx) => `
                <div class="pdm-bar-item ${idx === 0 ? 'is-winner' : ''}">
                  <div class="pdm-bar-info">
                    <span class="pdm-rank-badge">#${idx + 1}</span>
                    <span class="pdm-bar-name">${item.name}</span>
                    <span class="pdm-bar-badge" style="border-color: ${item.color}40; color: ${item.color}">${item.badge}</span>
                    <span class="pdm-bar-score">${item.score} / ${results.maxPossible} (${item.pct}٪)</span>
                  </div>
                  <div class="pdm-bar-track">
                    <div class="pdm-bar-fill" style="width: ${item.pct}%; background: linear-gradient(90deg, ${item.color}, #0284c7);"></div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- INTERACTIVE MATRIX TABLE -->
          <div class="pdm-table-wrapper">
            <table class="pdm-table">
              <thead>
                <tr>
                  <th class="col-crit">${isFa ? 'معیار ارزیابی مهندسی' : 'Engineering Criterion'}</th>
                  <th class="col-weight">${isFa ? 'وزن اهمیت (۱ تا ۵)' : 'Weight (1-5)'}</th>
                  ${currentPreset.options.map(opt => {
                    const isWin = results.winner.id === opt.id;
                    return `
                      <th class="col-opt ${isWin ? 'col-winner' : ''}">
                        <div class="pdm-th-card ${isWin ? 'is-winner' : ''}">
                          <div class="pdm-th-top">
                            <span class="pdm-opt-dot" style="background: ${opt.color};"></span>
                            <span class="pdm-opt-type">${isFa ? opt.badgeFa : opt.badgeEn}</span>
                            ${isWin ? `<span class="pdm-win-ribbon"><i data-lucide="crown" style="width: 11px; height: 11px;"></i> ${isFa ? 'برنده' : 'Winner'}</span>` : ''}
                          </div>
                          <div class="pdm-th-title">${isFa ? opt.nameFa : opt.nameEn}</div>
                        </div>
                      </th>
                    `;
                  }).join('')}
                  <th class="col-actions"></th>
                </tr>
              </thead>
              <tbody>
                ${currentPreset.criteria.map((crit, cIdx) => `
                  <tr data-crit-id="${crit.id}">
                    <td class="crit-title-cell">
                      <div class="pdm-crit-name-wrap">
                        <span class="pdm-crit-num">${cIdx + 1}</span>
                        <input type="text" class="pdm-crit-input" data-crit-idx="${cIdx}" value="${isFa ? crit.nameFa : crit.nameEn}" placeholder="${isFa ? 'عنوان معیار...' : 'Criterion name...'}">
                      </div>
                    </td>
                    <td class="crit-weight-cell">
                      <div class="pdm-weight-card">
                        <button type="button" class="pdm-step-btn btn-weight-down" data-crit-idx="${cIdx}" title="${isFa ? 'کاهش وزن' : 'Decrease weight'}">
                          <i data-lucide="minus" style="width: 12px; height: 12px;"></i>
                        </button>
                        <span class="pdm-weight-badge" title="${isFa ? 'وزن معیار از ۵' : 'Weight out of 5'}">${crit.weight}</span>
                        <button type="button" class="pdm-step-btn btn-weight-up" data-crit-idx="${cIdx}" title="${isFa ? 'افزایش وزن' : 'Increase weight'}">
                          <i data-lucide="plus" style="width: 12px; height: 12px;"></i>
                        </button>
                      </div>
                    </td>
                    ${currentPreset.options.map(opt => {
                      const score = Number(crit.scores[opt.id]) || 1;
                      const product = crit.weight * score;
                      const isWinCol = results.winner.id === opt.id;
                      return `
                        <td class="score-cell ${isWinCol ? 'cell-winner' : ''}">
                          <div class="pdm-cell-card">
                            <div class="pdm-stepper-wrap">
                              <button type="button" class="pdm-step-btn btn-score-down" data-crit-idx="${cIdx}" data-opt-id="${opt.id}" title="${isFa ? 'کاهش نمره' : 'Decrease score'}">
                                <i data-lucide="minus" style="width: 12px; height: 12px;"></i>
                              </button>
                              <div class="pdm-score-chip score-lvl-${score}">
                                <span class="pdm-score-num">${score}</span>
                                <span class="pdm-score-max">/۵</span>
                              </div>
                              <button type="button" class="pdm-step-btn btn-score-up" data-crit-idx="${cIdx}" data-opt-id="${opt.id}" title="${isFa ? 'افزایش نمره' : 'Increase score'}">
                                <i data-lucide="plus" style="width: 12px; height: 12px;"></i>
                              </button>
                            </div>
                            <div class="pdm-product-badge" title="${crit.weight} × ${score} = ${product}">
                              <span class="pdm-prod-label">${isFa ? 'امتیاز وزنی' : 'Score'}:</span>
                              <span class="pdm-prod-val">${product}</span>
                            </div>
                          </div>
                        </td>
                      `;
                    }).join('')}
                    <td class="action-cell">
                      ${currentPreset.criteria.length > 2 ? `
                        <button type="button" class="pdm-del-crit-btn" data-crit-idx="${cIdx}" title="${isFa ? 'حذف این معیار' : 'Delete criterion'}">
                          <i data-lucide="trash-2" style="width: 15px; height: 15px;"></i>
                        </button>
                      ` : ''}
                    </td>
                  </tr>
                `).join('')}
              </tbody>
              <tfoot>
                <tr class="pdm-total-row">
                  <td colspan="2" class="pdm-total-lbl-cell">
                    <div class="pdm-total-lbl-wrap">
                      <div class="pdm-total-main-lbl">
                        <i data-lucide="calculator" style="width: 17px; height: 17px; color: var(--accent-cyan);"></i>
                        <span>${isFa ? 'مجموع امتیاز وزنی نهایی' : 'Final Total Score'}</span>
                      </div>
                      <span class="pdm-formula-pill">\\( \\sum W_i \\times S_{ij} \\)</span>
                    </div>
                  </td>
                  ${currentPreset.options.map(opt => {
                    const isWin = results.winner.id === opt.id;
                    const val = results.totals[opt.id];
                    const pct = results.maxPossible > 0 ? Math.round((val / results.maxPossible) * 100) : 0;
                    return `
                      <td class="pdm-total-val-cell ${isWin ? 'is-winner-total' : ''}">
                        <div class="pdm-total-box">
                          <div class="pdm-total-score-row">
                            <span class="pdm-total-number">${val}</span>
                            <span class="pdm-total-max">/ ${results.maxPossible}</span>
                          </div>
                          <div class="pdm-total-pct-bar">
                            <div class="pdm-total-pct-fill" style="width: ${pct}%; background: ${isWin ? 'linear-gradient(90deg, #10b981, #00f2fe)' : opt.color};"></div>
                          </div>
                          ${isWin 
                            ? `<span class="pdm-winner-stamp"><i data-lucide="check-circle" style="width: 13px; height: 13px;"></i> ${isFa ? 'بهترین گزینه' : 'Optimal'}</span>` 
                            : `<span class="pdm-rank-stamp">${pct}٪</span>`
                          }
                        </div>
                      </td>
                    `;
                  }).join('')}
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>

          <!-- TOOL ACTION BAR -->
          <div class="pdm-actions-bar">
            <div class="pdm-action-group-left">
              <button type="button" class="pdm-btn-act" id="pdmAddCriterionBtn">
                <i data-lucide="plus" style="width: 14px; height: 14px;"></i>
                <span>${isFa ? 'افزودن معیار جدید' : 'Add Criterion'}</span>
              </button>
              <button type="button" class="pdm-btn-act" id="pdmResetBtn">
                <i data-lucide="rotate-ccw" style="width: 14px; height: 14px;"></i>
                <span>${isFa ? 'بازنشانی مقادیر' : 'Reset Preset'}</span>
              </button>
            </div>

            <div class="pdm-action-group-right">
              <button type="button" class="pdm-btn-act pdm-btn-copy" id="pdmCopySummaryBtn">
                <i data-lucide="copy" style="width: 14px; height: 14px;"></i>
                <span>${isFa ? 'کپی گزارش تحلیل' : 'Copy Summary Report'}</span>
              </button>
            </div>
          </div>

          <!-- TOAST CONTAINER -->
          <div id="pdmToast" class="pdm-toast" aria-live="polite"></div>
        </div>
      `;

      if (window.lucide && typeof window.lucide.createIcons === 'function') {
        window.lucide.createIcons();
      }
    }

    bindEvents() {
      if (!this.container) return;

      // Event delegation on container
      this.container.addEventListener('click', (e) => {
        // 1. Preset switcher
        const presetBtn = e.target.closest('.pdm-preset-btn');
        if (presetBtn) {
          const key = presetBtn.getAttribute('data-preset');
          if (key) this.setPreset(key);
          return;
        }

        // 2. Weight stepper up/down
        const weightUp = e.target.closest('.btn-weight-up');
        if (weightUp) {
          const idx = parseInt(weightUp.getAttribute('data-crit-idx'), 10);
          if (!isNaN(idx) && this.state.criteria[idx]) {
            this.state.criteria[idx].weight = Math.min(5, (this.state.criteria[idx].weight || 1) + 1);
            this.render();
          }
          return;
        }

        const weightDown = e.target.closest('.btn-weight-down');
        if (weightDown) {
          const idx = parseInt(weightDown.getAttribute('data-crit-idx'), 10);
          if (!isNaN(idx) && this.state.criteria[idx]) {
            this.state.criteria[idx].weight = Math.max(1, (this.state.criteria[idx].weight || 1) - 1);
            this.render();
          }
          return;
        }

        // 3. Score stepper up/down
        const scoreUp = e.target.closest('.btn-score-up');
        if (scoreUp) {
          const cIdx = parseInt(scoreUp.getAttribute('data-crit-idx'), 10);
          const optId = scoreUp.getAttribute('data-opt-id');
          if (!isNaN(cIdx) && optId && this.state.criteria[cIdx]) {
            const cur = Number(this.state.criteria[cIdx].scores[optId]) || 1;
            this.state.criteria[cIdx].scores[optId] = Math.min(5, cur + 1);
            this.render();
          }
          return;
        }

        const scoreDown = e.target.closest('.btn-score-down');
        if (scoreDown) {
          const cIdx = parseInt(scoreDown.getAttribute('data-crit-idx'), 10);
          const optId = scoreDown.getAttribute('data-opt-id');
          if (!isNaN(cIdx) && optId && this.state.criteria[cIdx]) {
            const cur = Number(this.state.criteria[cIdx].scores[optId]) || 1;
            this.state.criteria[cIdx].scores[optId] = Math.max(1, cur - 1);
            this.render();
          }
          return;
        }

        // 4. Delete criterion
        const delBtn = e.target.closest('.pdm-del-crit-btn');
        if (delBtn) {
          const idx = parseInt(delBtn.getAttribute('data-crit-idx'), 10);
          if (!isNaN(idx) && this.state.criteria.length > 2) {
            this.state.criteria.splice(idx, 1);
            this.render();
          }
          return;
        }

        // 5. Add criterion button
        const addBtn = e.target.closest('#pdmAddCriterionBtn');
        if (addBtn) {
          this.addNewCriterion();
          return;
        }

        // 6. Reset button
        const resetBtn = e.target.closest('#pdmResetBtn');
        if (resetBtn) {
          this.state = JSON.parse(JSON.stringify(PRESETS[this.currentPresetKey]));
          this.render();
          this.showToast(this.lang === 'fa' ? 'مقادیر سناریو بازنشانی شدند' : 'Values reset to default');
          return;
        }

        // 7. Copy summary button
        const copyBtn = e.target.closest('#pdmCopySummaryBtn');
        if (copyBtn) {
          this.copySummaryReport();
          return;
        }
      });

      // Handle criterion title edits
      this.container.addEventListener('change', (e) => {
        const critInput = e.target.closest('.pdm-crit-input');
        if (critInput) {
          const idx = parseInt(critInput.getAttribute('data-crit-idx'), 10);
          if (!isNaN(idx) && this.state.criteria[idx]) {
            const val = critInput.value.trim();
            if (val) {
              if (this.lang === 'fa') this.state.criteria[idx].nameFa = val;
              else this.state.criteria[idx].nameEn = val;
            }
          }
        }
      });
    }

    addNewCriterion() {
      const isFa = this.lang === 'fa';
      const count = this.state.criteria.length + 1;
      const newCrit = {
        id: 'c_' + Date.now(),
        nameFa: `معیار جدید ${count}`,
        nameEn: `Criterion ${count}`,
        weight: 3,
        scores: {}
      };
      this.state.options.forEach(opt => {
        newCrit.scores[opt.id] = 3;
      });
      this.state.criteria.push(newCrit);
      this.render();
      this.showToast(isFa ? 'معیار جدید با وزن ۳ اضافه شد' : 'New criterion added');
    }

    copySummaryReport() {
      const isFa = this.lang === 'fa';
      const results = this.calculateTotals();
      const preset = this.state;

      let text = `📊 ${isFa ? 'گزارش ماتریس تصمیم‌گیری وزنی (Pugh Matrix Analysis)' : 'Weighted Decision Matrix Report'}\n`;
      text += `${isFa ? 'سناریو' : 'Scenario'}: ${isFa ? preset.titleFa : preset.titleEn}\n\n`;

      text += `🏆 ${isFa ? 'گزینه برنده' : 'Winner'}: ${results.winner.name} (${results.winner.score} / ${results.maxPossible} ${isFa ? 'امتیاز' : 'pts'} - ${results.winner.pct}%)\n\n`;

      text += `${isFa ? 'رتبه‌بندی گزینه‌ها' : 'Rankings'}:\n`;
      results.ranked.forEach((item, i) => {
        text += `${i + 1}. ${item.name}: ${item.score} ${isFa ? 'امتیاز' : 'pts'} (${item.pct}%)\n`;
      });

      text += `\n${isFa ? 'معیارها و اوزان' : 'Criteria & Weights'}:\n`;
      preset.criteria.forEach(c => {
        const name = isFa ? c.nameFa : c.nameEn;
        text += `• ${name} (${isFa ? 'وزن' : 'Weight'}: ${c.weight})\n`;
      });

      text += `\n${isFa ? 'تولید شده در پورتفولیوی مهندسی محمدامین شریف (دانشگاه علم و صنعت ایران)' : 'Generated via Mohammadamin Sharif Engineering Portfolio (IUST)'}`;

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => {
          this.showToast(isFa ? 'گزارش تحلیل در کلیپ‌بورد کپی شد!' : 'Report copied to clipboard!');
        }).catch(() => {
          this.fallbackCopy(text);
        });
      } else {
        this.fallbackCopy(text);
      }
    }

    fallbackCopy(text) {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand('copy');
        this.showToast(this.lang === 'fa' ? 'گزارش کپی شد!' : 'Copied!');
      } catch (e) {
        this.showToast(this.lang === 'fa' ? 'امکان کپی خودکار فراهم نشد' : 'Could not copy');
      }
      document.body.removeChild(ta);
    }

    showToast(msg) {
      const toast = this.container.querySelector('#pdmToast');
      if (!toast) return;
      toast.textContent = msg;
      toast.classList.add('visible');
      setTimeout(() => {
        toast.classList.remove('visible');
      }, 2500);
    }
  }

  // Global export & auto-initialization
  window.BusinessDecisionMatrix = BusinessDecisionMatrix;

  function initDecisionMatrices() {
    if (document.getElementById('businessDecisionToolWorkbench') && !window.activePughMatrix) {
      window.activePughMatrix = new BusinessDecisionMatrix('businessDecisionToolWorkbench', 'business');
    }
    if (document.getElementById('bookChapter2DecisionTool') && !window.bookPughMatrix) {
      window.bookPughMatrix = new BusinessDecisionMatrix('bookChapter2DecisionTool', 'business');
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDecisionMatrices);
  } else {
    initDecisionMatrices();
  }

  // Observe language attribute changes on root HTML
  if (typeof MutationObserver !== 'undefined') {
    const langObserver = new MutationObserver((mutations) => {
      mutations.forEach(mutation => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'lang') {
          const newLang = document.documentElement.getAttribute('lang') || 'fa';
          if (window.activePughMatrix) {
            window.activePughMatrix.lang = newLang;
            window.activePughMatrix.render();
          }
          if (window.bookPughMatrix) {
            window.bookPughMatrix.lang = newLang;
            window.bookPughMatrix.render();
          }
        }
      });
    });
    langObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
  }

})();
