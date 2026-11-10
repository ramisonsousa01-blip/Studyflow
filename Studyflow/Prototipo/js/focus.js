// Módulo do Modo Foco — Técnica Pomodoro com Temporizador Real
let P = {
  cust: false,
  ph: 'f', // 'f' = foco, 'b' = descanso
  left: 0,
  run: false,
  h: null,
  sub: '',
  completedSessionNotice: null
};

const getFocusDur = () => (P.ph === 'f' ? (S.fm || 25) : (S.bm || 5)) * 60;

// Notificação sonora suave via Web Audio API (sem dependência de arquivo externo)
function playChime() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.setValueAtTime(880, ctx.currentTime + 0.15); // A5
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);
    osc.start();
    osc.stop(ctx.currentTime + 0.65);
  } catch (e) {
    // Silencioso se bloqueado pelo navegador
  }
}

function vFocus() {
  if (!P.left) P.left = getFocusDur();
  
  const subjects = typeof subNames === 'function' ? subNames() : [];
  const pendingTasks = (S.tasks || []).filter(t => !t.done);
  
  const subOptions = [
    '<option value="">Estudo Livre / Sem tarefa específica</option>',
    '<optgroup label="Tarefas e Compromissos">',
    ...pendingTasks.map(t => `<option value="${esc(t.t)}" ${P.sub === t.t ? 'selected' : ''}>${esc(t.t)} (${esc(t.s)})</option>`),
    '</optgroup>',
    '<optgroup label="Disciplinas">',
    ...subjects.map(s => `<option value="${esc(s)}" ${P.sub === s ? 'selected' : ''}>${esc(s)}</option>`),
    '</optgroup>'
  ].join('');

  const focusPresets = [15, 20, 25, 30, 45, 50, 60];
  const breakPresets = [3, 5, 10, 15, 20];
  
  if (!focusPresets.includes(S.fm)) focusPresets.push(S.fm);
  if (!breakPresets.includes(S.bm)) breakPresets.push(S.bm);
  focusPresets.sort((a, b) => a - b);
  breakPresets.sort((a, b) => a - b);

  return `
    <div class="focus-screen">
      <div class="focus-top-bar">
        <div class="focus-titles">
          <h1>Modo Foco</h1>
          <p class="sub">Técnica Pomodoro: maximize sua concentração com ciclos cronometrados.</p>
        </div>
      </div>

      <div class="focus-container">
        <!-- Alternador Pomodoro Padrão vs Personalizado -->
        <div class="focus-mode-toggle" role="tablist">
          <button role="tab" aria-selected="${!P.cust}" data-focus-mode="preset" class="${!P.cust ? 'active' : ''}">
            Pomodoro (25/5 min)
          </button>
          <button role="tab" aria-selected="${P.cust}" data-focus-mode="custom" class="${P.cust ? 'active' : ''}">
            Personalizado
          </button>
        </div>

        <!-- Seletor do que estudar -->
        <div class="focus-subject-picker">
          <label for="fsub">${ic('book')} O que você está estudando agora?</label>
          <select id="fsub">
            ${subOptions}
          </select>
        </div>

        <!-- Indicador de Fase Ativa -->
        <div class="focus-phases">
          <span class="phase-pill ${P.ph === 'f' ? 'active' : ''}" id="ph1">
            <span class="phase-indicator"></span> Concentração (${S.fm} min)
          </span>
          <span class="phase-pill ${P.ph === 'b' ? 'active' : ''}" id="ph2">
            <span class="phase-indicator"></span> Descanso Curto (${S.bm} min)
          </span>
        </div>

        <!-- Anel Circular do Temporizador -->
        <div class="timer-ring-container">
          <svg viewBox="0 0 100 100" class="timer-svg" aria-hidden="true">
            <circle cx="50" cy="50" r="45" class="timer-track" />
            <circle id="arc" cx="50" cy="50" r="45" class="timer-progress" 
              stroke-dasharray="282.7" stroke-dashoffset="0" />
          </svg>
          <div class="timer-center-content">
            <div class="timer-display" id="tm" role="timer" aria-live="off">
              25:00
            </div>
            <div class="timer-sublabel" id="cy">
              ${P.ph === 'f' ? 'Foco' : 'Descanso'} · Ciclo ${(S.cycles || 0) + (P.ph === 'f' ? 1 : 0)}
            </div>
          </div>
        </div>

        <!-- Frase Motivacional -->
        <p class="focus-motivation" id="focusMotiv">
          ${P.ph === 'f' ? 'Elimine as distrações e mergulhe no conteúdo.' : 'Respire fundo, beba água e relaxe a mente.'}
        </p>

        <!-- Controles Principais -->
        <div class="focus-controls">
          <button class="btn-ctrl-round" data-fr title="Reiniciar fase atual" aria-label="Reiniciar fase">
            ${ic('reset')}
          </button>
          <button class="btn btn-focus-primary" id="fp" data-fp aria-label="Iniciar ou pausar temporizador">
            ${ic(P.run ? 'pause' : 'play')}
            <span>${P.run ? 'Pausar' : (P.left < getFocusDur() ? 'Continuar' : 'Iniciar Foco')}</span>
          </button>
          <button class="btn-ctrl-round" data-fs title="Encerrar ciclo" aria-label="Parar temporizador">
            ${ic('stop')}
          </button>
        </div>

        <!-- Seletor de tempos no modo personalizado -->
        ${P.cust ? `
          <div class="custom-times-box">
            <div class="custom-time-item">
              <label for="fm">Tempo de Foco</label>
              <select id="fm">
                ${focusPresets.map(m => `<option value="${m}" ${m === S.fm ? 'selected' : ''}>${m} minutos</option>`).join('')}
              </select>
            </div>
            <div class="custom-time-item">
              <label for="bm">Tempo de Descanso</label>
              <select id="bm">
                ${breakPresets.map(m => `<option value="${m}" ${m === S.bm ? 'selected' : ''}>${m} minutos</option>`).join('')}
              </select>
            </div>
          </div>
        ` : ''}

        <!-- Estatísticas da Sessão -->
        <div class="focus-stats-card">
          <h3>Estatísticas de Concentração (Hoje)</h3>
          <div class="focus-stats-grid">
            <div class="stat-item">
              <b>${Math.floor((S.mins || 0) / 60)}h ${String((S.mins || 0) % 60).padStart(2, '0')}m</b>
              <span>Tempo focado</span>
            </div>
            <div class="stat-item">
              <b>${S.cycles || 0}</b>
              <span>Ciclos concluídos</span>
            </div>
            <div class="stat-item">
              <b>${(S.sessions || []).length}</b>
              <span>Sessões totais</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function tick() {
  const tm = $('#tm');
  if (!tm) return;
  const m = Math.floor(P.left / 60);
  const s = P.left % 60;
  const formatted = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  tm.textContent = formatted;
  
  if (P.run) {
    document.title = `(${formatted}) StudyFlow Modo Foco`;
  } else {
    document.title = 'StudyFlow';
  }

  const arc = $('#arc');
  if (arc) {
    const total = getFocusDur();
    const ratio = Math.max(0, Math.min(1, 1 - (P.left / total)));
    arc.style.strokeDashoffset = (282.7 * ratio).toFixed(1);
    if (P.ph === 'b') {
      arc.style.stroke = 'var(--ok)';
    } else {
      arc.style.stroke = 'var(--p2)';
    }
  }

  const cy = $('#cy');
  if (cy) {
    cy.textContent = `${P.ph === 'f' ? 'Foco' : 'Descanso'} · Ciclo ${(S.cycles || 0) + (P.ph === 'f' ? 1 : 0)}`;
  }

  const ph1 = $('#ph1');
  const ph2 = $('#ph2');
  if (ph1 && ph2) {
    ph1.classList.toggle('active', P.ph === 'f');
    ph2.classList.toggle('active', P.ph === 'b');
  }

  const fp = $('#fp');
  if (fp) {
    fp.innerHTML = `
      ${ic(P.run ? 'pause' : 'play')}
      <span>${P.run ? 'Pausar' : (P.left < getFocusDur() ? 'Continuar' : 'Iniciar Foco')}</span>
    `;
  }
}

function stopT() {
  clearInterval(P.h);
  P.run = false;
  document.title = 'StudyFlow';
}

function startT() {
  if (P.run) return;
  P.run = true;
  P.h = setInterval(() => {
    P.left--;
    
    // Contabiliza minutos reais estudados durante a fase de foco
    if (P.ph === 'f' && P.left % 60 === 59) {
      S.mins = (S.mins || 0) + 1;
      save();
    }
    
    // Quando a contagem chega ao fim:
    if (P.left <= 0) {
      playChime();
      if (P.ph === 'f') {
        S.cycles = (S.cycles || 0) + 1;
        S.sessions = S.sessions || [];
        S.sessions.push({
          d: TODAY,
          m: S.fm || 25,
          s: P.sub || 'Geral'
        });
        save();
        toast('🎉 Ciclo de concentração concluído! Hora do seu descanso.', 'ok');
        P.ph = 'b';
        P.left = getFocusDur();
      } else {
        toast('🔔 Intervalo concluído! Pronto para o próximo ciclo de foco?', 'info');
        P.ph = 'f';
        P.left = getFocusDur();
      }
      stopT();
      if (view === 'focus') render();
    }
    tick();
  }, 1000);
  tick();
}
