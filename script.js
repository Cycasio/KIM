const factorList = document.querySelector('#factorList');
const totalScoreEl = document.querySelector('#totalScore');
const riskLevelEl = document.querySelector('#riskLevel');
const summaryCard = document.querySelector('#summaryCard');
const thresholdInputs = {
  low: document.querySelector('#lowThreshold'),
  medium: document.querySelector('#mediumThreshold'),
  high: document.querySelector('#highThreshold')
};
const resetBtn = document.querySelector('#resetBtn');
const exportBtn = document.querySelector('#exportBtn');

const factorTemplate = [
  {
    id: 'loadWeight',
    title: '重量/負荷 (每件或等效力量)',
    description: '參考 PDF 的重量區間，預設為常見值，可依實務修改。',
    options: [
      { label: '≤ 5 kg', detail: '偶爾提舉', score: 2 },
      { label: '6 – 10 kg', detail: '輕負荷', score: 4 },
      { label: '11 – 15 kg', detail: '中等', score: 6 },
      { label: '16 – 20 kg', detail: '偏重', score: 9 },
      { label: '21 – 25 kg', detail: '重負荷', score: 12 },
      { label: '≥ 26 kg', detail: '極重，須特別注意', score: 16 }
    ]
  },
  {
    id: 'frequency',
    title: '動作頻率 / 持續時間',
    description: '每小時提舉/搬運次數或持續握持時間。',
    options: [
      { label: '≤ 5 次/小時 或 握持 ≤ 10 秒', detail: '低頻率', score: 2 },
      { label: '6 – 15 次/小時 或 10–30 秒', detail: '偶爾/短暫', score: 5 },
      { label: '16 – 30 次/小時 或 30–60 秒', detail: '中頻/中等時間', score: 9 },
      { label: '31 – 60 次/小時 或 1–3 分鐘', detail: '高頻或較長', score: 13 },
      { label: '≥ 61 次/小時 或 > 3 分鐘', detail: '非常頻繁或長時間保持', score: 17 }
    ]
  },
  {
    id: 'posture',
    title: '身體/手部姿勢',
    description: '彎腰、扭轉、手臂外伸或側提等會增加負荷的姿勢。',
    options: [
      { label: '中立姿勢', detail: '背部直、手靠近身體', score: 1 },
      { label: '輕微彎腰或外伸', detail: '偶有不利姿勢', score: 3 },
      { label: '彎腰 > 30°、扭轉或外伸 > 30cm', detail: '明顯不利姿勢', score: 7 },
      { label: '極度彎腰/扭轉，單手提舉', detail: '高度不利', score: 10 }
    ]
  },
  {
    id: 'grip',
    title: '把手與抓握品質',
    description: '考量手柄、抓握空間、防滑性等。',
    options: [
      { label: '優良抓握', detail: '有手柄、乾燥、不打滑', score: 0 },
      { label: '尚可', detail: '可抓握但需注意', score: 2 },
      { label: '困難', detail: '無手柄/體積大/打滑', score: 5 }
    ]
  },
  {
    id: 'distance',
    title: '搬運距離/樓梯/高度差',
    description: '含水平距離、樓梯、台階或高度差。',
    options: [
      { label: '≤ 2 公尺且同高度', detail: '極短距離', score: 0 },
      { label: '3 – 10 公尺或輕微高度差', detail: '短距離', score: 2 },
      { label: '11 – 20 公尺或樓梯 1–2 層', detail: '中等距離', score: 4 },
      { label: '≥ 21 公尺或重複樓梯/坡道', detail: '長距離或高度差大', score: 7 }
    ]
  },
  {
    id: 'conditions',
    title: '工作條件與組織',
    description: '空間限制、地面品質、時間壓力、個體防護等因素。',
    options: [
      { label: '理想環境', detail: '空間充足、地面平整、無時間壓力', score: 0 },
      { label: '有些限制', detail: '空間略小或偶有時間壓力', score: 2 },
      { label: '多重限制', detail: '狹窄/濕滑/高時間壓力', score: 5 },
      { label: '極度不利', detail: '危險環境或明顯時間/生理負荷', score: 8 }
    ]
  }
];

const state = {
  thresholds: { low: 19, medium: 44, high: 69 },
  factors: {}
};

function renderFactors() {
  const fragment = document.createDocumentFragment();

  factorTemplate.forEach((factor) => {
    state.factors[factor.id] = factor.options[0].score;

    const card = document.createElement('article');
    card.className = 'factor';

    const header = document.createElement('header');
    const title = document.createElement('h3');
    title.textContent = factor.title;
    title.className = 'title';
    const badge = document.createElement('div');
    badge.className = 'badge';
    badge.textContent = factor.options[0].score ? `目前 ${factor.options[0].score} 點` : '0 點';
    badge.dataset.badgeFor = factor.id;
    header.append(title, badge);

    const desc = document.createElement('p');
    desc.textContent = factor.description;
    desc.className = 'desc';

    const optionsWrap = document.createElement('div');

    factor.options.forEach((opt, index) => {
      const row = document.createElement('div');
      row.className = 'option-row';

      const label = document.createElement('label');
      label.className = 'option-label';
      label.innerHTML = `${opt.label}<span>${opt.detail}</span>`;

      const select = document.createElement('input');
      select.type = 'radio';
      select.name = factor.id;
      select.value = opt.score;
      select.checked = index === 0;
      select.addEventListener('change', () => updateFactor(factor.id, opt.score));

      const scoreInput = document.createElement('input');
      scoreInput.type = 'number';
      scoreInput.min = '0';
      scoreInput.value = opt.score;
      scoreInput.addEventListener('input', (e) => {
        const newScore = Number(e.target.value) || 0;
        opt.score = newScore;
        if (select.checked) updateFactor(factor.id, newScore, true);
      });

      row.append(label, select, scoreInput);
      optionsWrap.appendChild(row);
    });

    const note = document.createElement('div');
    note.className = 'note-row';
    note.innerHTML = '自訂分數以符合最新 PDF；勾選後自動帶入總分。';

    card.append(header, desc, optionsWrap, note);
    fragment.appendChild(card);
  });

  factorList.appendChild(fragment);
}

function updateFactor(id, score, fromInput = false) {
  state.factors[id] = score;
  const badge = document.querySelector(`[data-badge-for="${id}"]`);
  if (badge) badge.textContent = `目前 ${score} 點`;
  calculateTotal();
  if (fromInput) {
    const radio = document.querySelector(`input[name="${id}"]:checked`);
    if (radio) radio.value = score;
  }
}

function calculateTotal() {
  const total = Object.values(state.factors).reduce((acc, val) => acc + Number(val || 0), 0);
  totalScoreEl.textContent = total;
  const risk = determineRisk(total);
  riskLevelEl.textContent = risk.label;
  summaryCard.className = `summary-card ${risk.className}`;
}

function determineRisk(total) {
  const { low, medium, high } = state.thresholds;
  if (total <= low) return { label: '低風險', className: 'safe' };
  if (total <= medium) return { label: '中等風險', className: 'warn' };
  if (total <= high) return { label: '顯著風險', className: 'danger' };
  return { label: '極高風險 (需立即介入)', className: 'danger' };
}

function syncThresholds() {
  state.thresholds.low = Number(thresholdInputs.low.value) || 0;
  state.thresholds.medium = Number(thresholdInputs.medium.value) || 0;
  state.thresholds.high = Number(thresholdInputs.high.value) || 0;
  calculateTotal();
}

function resetForm() {
  Object.keys(state.factors).forEach((id, idx) => {
    const factor = factorTemplate.find((f) => f.id === id);
    const defaultScore = factor?.options?.[0]?.score ?? 0;
    state.factors[id] = defaultScore;
    const radio = document.querySelector(`input[name="${id}"]`);
    if (radio) radio.checked = true;
    const badge = document.querySelector(`[data-badge-for="${id}"]`);
    if (badge) badge.textContent = `目前 ${defaultScore} 點`;
  });
  thresholdInputs.low.value = 19;
  thresholdInputs.medium.value = 44;
  thresholdInputs.high.value = 69;
  syncThresholds();
}

function exportResult() {
  const payload = {
    totalScore: Number(totalScoreEl.textContent),
    riskLevel: riskLevelEl.textContent,
    thresholds: { ...state.thresholds },
    factors: { ...state.factors },
    exportedAt: new Date().toISOString()
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'kim-lhc-result.json';
  a.click();
  URL.revokeObjectURL(url);
}

function init() {
  renderFactors();
  calculateTotal();
  Object.values(thresholdInputs).forEach((input) => input.addEventListener('input', syncThresholds));
  resetBtn.addEventListener('click', resetForm);
  exportBtn.addEventListener('click', exportResult);
}

init();
