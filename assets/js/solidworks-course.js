/**
 * SolidWorks Engineering Academy & Blueprint Lab Engine
 * دوره جامع آموزش مهندسی سالیدورکس - موتور تعاملی سرفصل‌ها، تمرین‌ها و کوییز
 */

// Filter chapters/modules
function filterSwChapter(chapterId, btn) {
  const allBtns = document.querySelectorAll('.sw-tab-btn');
  allBtns.forEach(b => b.classList.remove('active'));
  if (btn) {
    btn.classList.add('active');
  } else {
    // activate matching button if found
    allBtns.forEach(b => {
      const onclickAttr = b.getAttribute('onclick') || '';
      if (onclickAttr.includes(`'${chapterId}'`)) b.classList.add('active');
    });
  }

  const allCards = document.querySelectorAll('.sw-chapter-section');
  allCards.forEach(card => {
    const chap = card.getAttribute('data-chapter');
    if (chapterId === 'all' || chap === chapterId) {
      card.style.display = 'block';
      card.style.animation = 'fadeInUp 0.3s ease forwards';
    } else {
      card.style.display = 'none';
    }
  });

  try {
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  } catch (e) {}
}

window.filterSwChapter = filterSwChapter;
window.searchSwTools = searchSwTools;
window.answerSwQuiz = answerSwQuiz;
window.resetSwQuiz = resetSwQuiz;

// Search tools and content
function searchSwTools(query) {
  const q = query.trim().toLowerCase();
  const toolCards = document.querySelectorAll('.sw-tool-card, .sw-exercise-card');
  
  if (!q) {
    toolCards.forEach(c => c.style.display = 'flex');
    return;
  }

  toolCards.forEach(card => {
    const text = card.textContent.toLowerCase();
    if (text.includes(q)) {
      card.style.display = 'flex';
    } else {
      card.style.display = 'none';
    }
  });
}

// Interactive Quiz state
let swQuizState = {
  score: 0,
  answered: {}
};

function answerSwQuiz(qId, selectedIdx, correctIdx, explanationFa, explanationEn) {
  if (swQuizState.answered[qId]) return;
  swQuizState.answered[qId] = true;

  const container = document.getElementById(`sw-q-${qId}`);
  if (!container) return;

  const buttons = container.querySelectorAll('.sw-quiz-option-btn');
  const isCorrect = selectedIdx === correctIdx;

  if (isCorrect) {
    swQuizState.score += 10;
    buttons[selectedIdx].classList.add('selected-correct');
    buttons[selectedIdx].innerHTML += ' <i data-lucide="check" style="width: 16px; height: 16px; color: #10b981;"></i>';
  } else {
    buttons[selectedIdx].classList.add('selected-wrong');
    buttons[selectedIdx].innerHTML += ' <i data-lucide="x" style="width: 16px; height: 16px; color: #ef4444;"></i>';
    buttons[correctIdx].classList.add('selected-correct');
  }

  // Show explanation
  const expBox = document.getElementById(`sw-exp-${qId}`);
  if (expBox) {
    expBox.style.display = 'block';
    expBox.innerHTML = `
      <div style="font-weight: 700; color: ${isCorrect ? '#10b981' : '#ef4444'}; margin-bottom: 4px;">
        ${isCorrect ? '✓ پاسخ صحیح است!' : '✗ پاسخ نادرست بود! پاسخ صحیح مشخص شد.'}
      </div>
      <div>${document.documentElement.lang === 'fa' ? explanationFa : explanationEn}</div>
    `;
  }

  // Update total score display
  const scoreBadge = document.getElementById('swQuizTotalScore');
  if (scoreBadge) {
    scoreBadge.textContent = `${swQuizState.score} / 70`;
  }

  try {
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  } catch (e) {}
}

function resetSwQuiz() {
  swQuizState = { score: 0, answered: {} };
  const buttons = document.querySelectorAll('.sw-quiz-option-btn');
  buttons.forEach(b => {
    b.classList.remove('selected-correct', 'selected-wrong');
    const icon = b.querySelector('svg');
    if (icon) icon.remove();
  });
  const expBoxes = document.querySelectorAll('.sw-quiz-explanation');
  expBoxes.forEach(box => {
    box.style.display = 'none';
    box.innerHTML = '';
  });
  const scoreBadge = document.getElementById('swQuizTotalScore');
  if (scoreBadge) scoreBadge.textContent = '0 / 70';
  try {
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  } catch (e) {}
}
