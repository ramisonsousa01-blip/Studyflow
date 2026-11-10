// Módulo de Disciplinas, Notas e Desempenho Escolar
const subNames = () => (S.subjects || []).map(x => x.n);
const subOf = name => (S.subjects || []).find(x => x.n === name);

const CRIT = {
  simple: 'Média simples',
  weighted: 'Média ponderada',
  sum: 'Soma de notas'
};

// Calcula a média da disciplina conforme o critério configurado
function subAvg(sb) {
  const list = (S.grades && S.grades[sb.n]) || [];
  if (!list.length) return null;
  
  if (sb.c === 'sum') {
    return list.reduce((acc, cur) => acc + (Number(cur.v) || 0), 0);
  }
  
  if (sb.c === 'weighted') {
    const totalWeight = list.reduce((acc, cur) => acc + (Number(cur.w) || 1), 0);
    if (!totalWeight) return null;
    const weightedSum = list.reduce((acc, cur) => acc + (Number(cur.v) || 0) * (Number(cur.w) || 1), 0);
    return weightedSum / totalWeight;
  }
  
  // default: 'simple'
  const sum = list.reduce((acc, cur) => acc + (Number(cur.v) || 0), 0);
  return sum / list.length;
}

// Calcula o aproveitamento percentual (0 a 100)
function subPercent(sb) {
  const avg = subAvg(sb);
  if (avg === null || !sb.max) return 0;
  return Math.min(100, Math.max(0, (avg / sb.max) * 100));
}

// Média geral normalizada na escala de 0 a 10
function gavg() {
  if (!S.subjects || !S.subjects.length) return null;
  const values = S.subjects.map(sb => {
    const a = subAvg(sb);
    if (a === null || !sb.max) return null;
    return Math.min(10, Math.max(0, (a / sb.max) * 10));
  }).filter(v => v !== null);
  
  if (!values.length) return null;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function vGrades() {
  const generalAvg = gavg();
  const subs = S.subjects || [];
  
  let approvedCount = 0;
  let belowCount = 0;
  let pendingCount = 0;

  subs.forEach(sb => {
    const a = subAvg(sb);
    if (a === null) pendingCount++;
    else if (a >= sb.pass) approvedCount++;
    else belowCount++;
  });

  const cardsHtml = subs.map(sb => {
    const avg = subAvg(sb);
    const gr = (S.grades && S.grades[sb.n]) || [];
    const color = col(sb.n);
    const isApproved = avg !== null && avg >= sb.pass;
    const pct = subPercent(sb);
    
    let statusBadge = '<span class="tag">Sem avaliações</span>';
    if (avg !== null) {
      statusBadge = isApproved 
        ? '<span class="tag ok">Atingiu o objetivo</span>'
        : '<span class="tag bad">Abaixo da meta</span>';
    }

    return `
      <div class="card grade-subject-card">
        <div class="grade-header">
          <div class="grade-title-group">
            <div class="ico" style="background:${color}">${ic('book')}</div>
            <div>
              <h3 class="t">${esc(sb.n)}</h3>
              <div class="sub">
                ${CRIT[sb.c] || 'Média simples'} · Meta: <b>${fmt(sb.pass)}</b> de <b>${fmt(sb.max)}</b>
              </div>
            </div>
          </div>
          <div class="grade-score-badge">
            <div class="grade-value" style="color:${avg !== null ? (isApproved ? 'var(--ok)' : 'var(--bad)') : 'var(--mut)'}">
              ${fmt(avg)}
            </div>
            ${statusBadge}
          </div>
        </div>

        <div class="progress-wrap">
          <div class="progress-info">
            <span>Aproveitamento acadêmico</span>
            <b>${avg !== null ? Math.round(pct) + '%' : '0%'}</b>
          </div>
          <div class="bar">
            <i style="width:${pct}%;background:${color}"></i>
          </div>
        </div>

        <div class="grade-history-toggle">
          <details ${gr.length > 0 ? '' : ''}>
            <summary>
              <span>Histórico de avaliações (${gr.length})</span>
            </summary>
            <div class="grade-history-list">
              ${gr.length > 0 ? gr.map(x => `
                <div class="history-item">
                  <div class="history-info">
                    <div class="t">${esc(x.t)}</div>
                    <div class="sub">
                      ${fd(x.d)}${sb.c === 'weighted' ? ` · Peso: ${x.w}` : ''}
                    </div>
                  </div>
                  <div class="history-score">
                    <b>${fmt(x.v)}</b>
                    <span class="sub">/${fmt(sb.max)}</span>
                  </div>
                  <div class="row-actions">
                    <button class="btn-icon" data-eg="${x.id}" title="Editar avaliação">${ic('edit')}</button>
                    <button class="btn-icon danger" data-dg="${x.id}" title="Excluir avaliação">${ic('trash')}</button>
                  </div>
                </div>
              `).join('') : '<p class="sub empty-hint">Nenhuma avaliação cadastrada ainda nesta disciplina.</p>'}
            </div>
          </details>
        </div>

        <div class="grade-card-footer">
          <button class="btn ghost sm" data-add-to-sub="${esc(sb.n)}">${ic('plus')}Lançar nota</button>
          <div class="footer-actions">
            <button class="btn-link" data-esub="${esc(sb.n)}">${ic('edit')}Configurar</button>
            <button class="btn-link danger" data-dsub="${esc(sb.n)}">${ic('trash')}Excluir</button>
          </div>
        </div>
      </div>
    `;
  }).join('');

  return `
    <div class="view-header">
      <div>
        <h1>Disciplinas e Notas</h1>
        <p class="sub">Acompanhe seu desempenho com critérios flexíveis para cada disciplina.</p>
      </div>
      <div class="header-actions">
        <button class="btn ghost" data-add="subj">${ic('plus')}Nova Disciplina</button>
        <button class="btn" data-add="grade">${ic('plus')}Registrar Nota</button>
      </div>
    </div>

    <div class="card general-performance-card">
      <div class="performance-ring-wrap">
        <div class="ring2">
          <svg viewBox="0 0 100 100" aria-hidden="true">
            <circle cx="50" cy="50" r="42" fill="none" stroke="var(--line)" stroke-width="9"/>
            <circle cx="50" cy="50" r="42" fill="none" stroke="var(--p)" stroke-width="9" stroke-linecap="round"
              stroke-dasharray="263.9" stroke-dashoffset="${263.9 * (1 - (generalAvg || 0) / 10)}"/>
          </svg>
          <div class="ring-center">
            <b>${fmt(generalAvg)}</b>
            <span>de 10</span>
          </div>
        </div>
        <div class="performance-text">
          <h2>Desempenho Geral do Semestre</h2>
          <p class="sub">Média consolidada ponderada proporcionalmente à nota máxima de cada matéria.</p>
          <div class="mini-stats-row">
            <div class="mini-stat">
              <span class="dot-status ok"></span>
              <span><b>${approvedCount}</b> aprovada${approvedCount !== 1 ? 's' : ''}</span>
            </div>
            ${belowCount > 0 ? `
              <div class="mini-stat">
                <span class="dot-status bad"></span>
                <span><b>${belowCount}</b> abaixo da meta</span>
              </div>
            ` : ''}
            <div class="mini-stat">
              <span class="dot-status mut"></span>
              <span><b>${subs.length}</b> no total</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="disciplines-grid">
      ${cardsHtml || emptyState('Nenhuma disciplina cadastrada', 'Cadastre as disciplinas da sua grade para registrar avaliações e acompanhar suas médias.', 'subj', 'Cadastrar Primeira Disciplina')}
    </div>
  `;
}
