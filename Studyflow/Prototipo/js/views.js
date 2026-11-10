// Módulo de Telas Principais do StudyFlow: Início, Cronograma, Calendário e Configurações

// Linha de tarefa / compromisso reutilizável
const taskRow = t => {
  const isDone = !!t.done;
  const color = KC[t.k] || KC.outro;
  return `
    <div class="list-item ${isDone ? 'is-done' : ''}">
      <button class="chk-box" role="checkbox" aria-checked="${isDone}" aria-label="Marcar como ${isDone ? 'pendente' : 'concluída'} ${esc(t.t)}" data-tog="${t.id}">
        ${isDone ? ic('chk') : ''}
      </button>
      <div class="kind-indicator" style="background:${color}" title="Categoria: ${KIND[t.k] || 'Outro'}"></div>
      <div class="item-content">
        <div class="item-title">${esc(t.t)}</div>
        <div class="item-meta">
          <span class="meta-sub" style="color:${col(t.s)}">${esc(t.s || 'Geral')}</span>
          <span class="meta-dot">·</span>
          <span>${KIND[t.k] || 'Outro'}</span>
          <span class="meta-dot">·</span>
          <span>${fd(t.d)}${t.h ? ' às ' + t.h : ''}</span>
          ${t.p ? `<span class="meta-dot">·</span><span class="meta-pri ${t.p.toLowerCase()}">${t.p}</span>` : ''}
          ${t.x ? `<span class="meta-dot">·</span><span class="meta-desc">${esc(t.x)}</span>` : ''}
        </div>
      </div>
      <div class="item-status">${dueTag(t)}</div>
      <div class="row-actions">
        <button class="btn-icon" data-edittask="${t.id}" title="Editar compromisso">${ic('edit')}</button>
        <button class="btn-icon danger" data-deltask="${t.id}" title="Excluir compromisso">${ic('trash')}</button>
      </div>
    </div>
  `;
};

// Linha de bloco de cronograma de estudos
const schRow = x => {
  const isDone = !!x.done;
  const color = col(x.s);
  return `
    <div class="list-item sched-item ${isDone ? 'is-done' : ''}">
      <button class="chk-box" role="checkbox" aria-checked="${isDone}" aria-label="Concluir estudo de ${esc(x.t)}" data-sdone="${x.id}">
        ${isDone ? ic('chk') : ''}
      </button>
      <div class="sched-time-badge">
        <b>${x.time}</b>
        <span>${endT(x)}</span>
      </div>
      <div class="item-content">
        <div class="item-meta" style="margin-bottom:2px">
          <span class="sub-pill" style="--c:${color}">${esc(x.s || 'Geral')}</span>
          <span class="meta-dur">${ic('clock')}${x.dur} min</span>
        </div>
        <div class="item-title">${esc(x.t)}</div>
        ${x.x ? `<div class="item-sub-desc">${esc(x.x)}</div>` : ''}
      </div>
      <div class="row-actions">
        <button class="btn-icon" data-editsch="${x.id}" title="Editar atividade">${ic('edit')}</button>
        <button class="btn-icon danger" data-delsch="${x.id}" title="Excluir atividade">${ic('trash')}</button>
      </div>
    </div>
  `;
};

// ==========================================
// 1. INÍCIO — PAINEL PRINCIPAL
// ==========================================
function vHome() {
  const pendingTasks = (S.tasks || []).filter(t => !t.done);
  const weekExams = pendingTasks.filter(t => t.k === 'prova' && t.d <= addD(7)).length;
  const sortedTasks = [...pendingTasks].sort((a, b) => a.d.localeCompare(b.d) || (a.h || '').localeCompare(b.h || ''));
  const todaySched = (S.sched || []).filter(x => x.day === TODAY).sort((a, b) => a.time.localeCompare(b.time));
  const generalAvg = gavg();
  const criticalDeadlines = sortedTasks.filter(t => t.d <= addD(2));
  const subjects = S.subjects || [];

  return `
    <!-- Cabeçalho com Saudação e Data -->
    <div class="view-header home-header">
      <div>
        <div class="date-chip">${ic('calendar')} ${wd(TODAY)}, ${fdLong(TODAY)}</div>
        <h1>Olá, ${esc(S.name)}!</h1>
        <p class="sub">Organize sua rotina, alcance suas metas e mantenha o foco nos estudos.</p>
      </div>

      <!-- Botões de Acesso Rápido Exigidos no item 4.A -->
      <div class="quick-actions-bar">
        <button class="btn ghost sm" data-add="task" title="Adicionar qualquer tarefa">
          ${ic('plus')}Nova Tarefa
        </button>
        <button class="btn ghost sm" data-add-prova title="Registrar prova ou trabalho">
          ${ic('alert')}Registrar Prova
        </button>
        <button class="btn sm" data-go="focus" title="Abrir temporizador Pomodoro">
          ${ic('focus')}Modo Foco
        </button>
      </div>
    </div>

    <!-- Indicadores de Progresso e Métricas no Topo -->
    <div class="stats-overview-grid">
      <div class="stat-card">
        <div class="stat-icon p-icon">${ic('book')}</div>
        <div class="stat-content">
          <b>${pendingTasks.length}</b>
          <span>Tarefas pendentes</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon red-icon">${ic('alert')}</div>
        <div class="stat-content">
          <b>${weekExams}</b>
          <span>Provas nesta semana</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon focus-icon">${ic('clock')}</div>
        <div class="stat-content">
          <b>${Math.floor((S.mins || 0) / 60)}h ${String((S.mins || 0) % 60).padStart(2, '0')}m</b>
          <span>Estudo focado hoje</span>
        </div>
      </div>
      <div class="stat-card" data-go="grades" style="cursor:pointer" title="Clique para ver notas">
        <div class="stat-icon green-icon">${ic('grades')}</div>
        <div class="stat-content">
          <b>${fmt(generalAvg)}</b>
          <span>Média geral acadêmica</span>
        </div>
      </div>
    </div>

    <!-- Layout Principal em 2 Colunas -->
    <div class="dashboard-columns">
      <!-- Coluna Esquerda: Rotina de Hoje e Próximos Compromissos -->
      <div class="dashboard-main-col">
        
        <!-- SEÇÃO: Sua rotina de hoje (Exigida no item 4.A) -->
        <div class="card">
          <div class="card-header">
            <div>
              <h2>Sua rotina de hoje</h2>
              <p class="sub">${todaySched.length} atividade${todaySched.length !== 1 ? 's' : ''} de estudo programada${todaySched.length !== 1 ? 's' : ''}</p>
            </div>
            <div class="header-btns">
              <button class="btn-link" data-go="sched">Ver cronograma completo</button>
              <button class="btn ghost sm" data-add="sched">${ic('plus')}Adicionar</button>
            </div>
          </div>
          
          <div class="card-list">
            ${todaySched.length > 0 
              ? todaySched.map(schRow).join('') 
              : emptyState('Sem estudos para hoje', 'Que tal reservar um horário de estudos para manter sua rotina em dia?', 'sched', 'Planejar Estudo Hoje')}
          </div>
        </div>

        <!-- SEÇÃO: Próximas Provas e Trabalhos -->
        <div class="card">
          <div class="card-header">
            <div>
              <h2>Próximas provas e trabalhos</h2>
              <p class="sub">Seus compromissos acadêmicos com prazos mais próximos</p>
            </div>
            <div class="header-btns">
              <button class="btn-link" data-go="calendar">Abrir calendário</button>
              <button class="btn ghost sm" data-add="task">${ic('plus')}Novo</button>
            </div>
          </div>

          <div class="card-list">
            ${sortedTasks.length > 0 
              ? sortedTasks.slice(0, 4).map(taskRow).join('')
              : emptyState('Nenhum compromisso pendente', 'Parabéns! Todas as suas tarefas foram concluídas.', 'task', 'Novo Compromisso')}
          </div>
        </div>

      </div>

      <!-- Coluna Direita: Modo Foco, Disciplinas e Lembretes -->
      <div class="dashboard-side-col">
        
        <!-- Card de Destaque do Modo Foco -->
        <div class="card focus-highlight-card">
          <div class="focus-hl-content">
            <span class="focus-hl-badge">${ic('focus')} Concentração</span>
            <h2>Modo Foco</h2>
            <p>Técnica Pomodoro com contagem regressiva de ${S.fm} min de concentração e ${S.bm} min de descanso.</p>
            <div class="focus-hl-stats">
              <span><b>${S.cycles || 0}</b> ciclos hoje</span>
              <span><b>${S.mins || 0}</b> min totais</span>
            </div>
            <button class="btn btn-focus-start" data-go="focus">
              ${ic('play')} Iniciar Modo Foco
            </button>
          </div>
        </div>

        <!-- Resumo das Disciplinas -->
        <div class="card">
          <div class="card-header">
            <h2>Resumo das disciplinas</h2>
            <button class="btn-link" data-go="grades">Ver notas</button>
          </div>
          
          <div class="mini-subjects-list">
            ${subjects.slice(0, 5).map(sb => {
              const a = subAvg(sb);
              const color = col(sb.n);
              const pct = subPercent(sb);
              const isOk = a !== null && a >= sb.pass;
              return `
                <div class="mini-sub-row">
                  <div class="mini-sub-info">
                    <span class="mini-sub-dot" style="background:${color}"></span>
                    <span class="mini-sub-name">${esc(sb.n)}</span>
                    <span class="mini-sub-score ${isOk ? 'ok' : (a !== null ? 'bad' : '')}">
                      ${fmt(a)}
                    </span>
                  </div>
                  <div class="bar mini-bar">
                    <i style="width:${pct}%;background:${color}"></i>
                  </div>
                </div>
              `;
            }).join('') || '<p class="sub">Nenhuma disciplina cadastrada ainda.</p>'}
          </div>
        </div>

        <!-- Lembretes e Alertas Internos (Item 4.F) -->
        <div class="card reminders-card">
          <div class="card-header">
            <h2>Lembretes importantes</h2>
            <span class="status-indicator-badge">${ic('bell')} Ativo</span>
          </div>
          
          <div class="reminders-list">
            ${criticalDeadlines.length > 0 ? criticalDeadlines.map(t => `
              <div class="reminder-item ${t.d === TODAY ? 'urgent' : ''}">
                <div class="reminder-icon">${ic('alert')}</div>
                <div class="reminder-body">
                  <b>${esc(t.t)}</b>
                  <span>${esc(t.s)} · ${t.d === TODAY ? 'Vence hoje!' : 'Vence amanhã!'}</span>
                </div>
              </div>
            `).join('') : `
              <div class="reminder-clean">
                ${ic('checkCircle')}
                <p>Nenhum prazo urgente para as próximas 48 horas.</p>
              </div>
            `}
          </div>
        </div>

      </div>
    </div>
  `;
}

// ==========================================
// 2. CRONOGRAMA DE ESTUDOS
// ==========================================
function vSched() {
  const baseDate = new Date(selDay + 'T12:00');
  const weekStart = new Date(baseDate);
  weekStart.setDate(baseDate.getDate() - baseDate.getDay()); // Domingo como início

  const weekDays = [...Array(7)].map((_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return d;
  });

  const getByDay = dayStr => (S.sched || []).filter(x => x.day === dayStr).sort((a, b) => a.time.localeCompare(b.time));

  return `
    <div class="view-header">
      <div>
        <h1>Cronograma de Estudos</h1>
        <p class="sub">Organize seus blocos diários e semanais de estudo com horários definidos.</p>
      </div>
      <div class="header-actions">
        <button class="btn" data-add="sched">${ic('plus')}Nova Atividade</button>
      </div>
    </div>

    <!-- Barra de Controles: Navegação de Data e Modo Dia / Semana -->
    <div class="sched-controls-bar">
      <div class="sched-nav-date">
        <button class="btn-icon" data-wk="-7" title="Semana anterior">${ic('left')}</button>
        <h2>${MES[baseDate.getMonth()]} de ${baseDate.getFullYear()}</h2>
        <button class="btn-icon" data-wk="7" title="Próxima semana">${ic('right')}</button>
        <button class="btn ghost sm" data-today title="Ir para hoje">Hoje</button>
      </div>

      <!-- Seletor de Modo: Dia ou Semana -->
      <div class="tabs-segmented" role="tablist">
        <button role="tab" aria-selected="${schedMode === 'day'}" data-sched-mode="day" class="${schedMode === 'day' ? 'active' : ''}">
          Visão por Dia
        </button>
        <button role="tab" aria-selected="${schedMode === 'week'}" data-sched-mode="week" class="${schedMode === 'week' ? 'active' : ''}">
          Visão por Semana
        </button>
      </div>
    </div>

    ${schedMode === 'day' ? `
      <!-- Seletor de Dias da Semana -->
      <div class="week-days-strip">
        ${weekDays.map(d => {
          const k = iso(d);
          const isSelected = k === selDay;
          const isToday = k === TODAY;
          const count = getByDay(k).length;
          return `
            <button class="day-strip-btn ${isSelected ? 'active' : ''} ${isToday ? 'is-today' : ''}" data-sel-day="${k}">
              <span class="day-wname">${DS[d.getDay()]}</span>
              <span class="day-num">${d.getDate()}</span>
              ${count > 0 ? `<span class="day-badge-dot"></span>` : ''}
            </button>
          `;
        }).join('')}
      </div>

      <!-- Lista de Atividades do Dia Selecionado -->
      <div class="card">
        <div class="card-header">
          <div>
            <h2>${wd(selDay)}, ${fdLong(selDay)}</h2>
            <p class="sub">${getByDay(selDay).length} bloco${getByDay(selDay).length !== 1 ? 's' : ''} programado${getByDay(selDay).length !== 1 ? 's' : ''}</p>
          </div>
          <button class="btn ghost sm" data-add="sched">${ic('plus')}Adicionar neste dia</button>
        </div>

        <div class="card-list">
          ${getByDay(selDay).length > 0 
            ? getByDay(selDay).map(schRow).join('') 
            : emptyState('Nenhuma atividade agendada', `Você não possui estudos agendados para ${wd(selDay).toLowerCase()}.`, 'sched', 'Programar Estudo')}
        </div>
      </div>
    ` : `
      <!-- Visão por Semana Completa -->
      <div class="week-grid-view">
        ${weekDays.map(d => {
          const k = iso(d);
          const isToday = k === TODAY;
          const items = getByDay(k);
          return `
            <div class="week-day-col card ${isToday ? 'today-highlight' : ''}">
              <div class="col-head">
                <span class="col-wname">${DS[d.getDay()]}</span>
                <span class="col-num">${d.getDate()}</span>
              </div>
              <div class="col-items">
                ${items.map(x => `
                  <div class="mini-sched-chip ${x.done ? 'is-done' : ''}" style="--c:${col(x.s)}" data-editsch="${x.id}" title="Clique para editar: ${esc(x.t)}">
                    <b>${x.time}</b> ${esc(x.t)}
                    <span class="chip-sub">(${esc(x.s)})</span>
                  </div>
                `).join('') || '<span class="empty-col">Livre</span>'}
              </div>
              <button class="col-add-btn" data-add-day="${k}" title="Adicionar atividade">+ Adicionar</button>
            </div>
          `;
        }).join('')}
      </div>
    `}
  `;
}

// ==========================================
// 3. CALENDÁRIO ACADÊMICO
// ==========================================
function vCalendar() {
  const year = calMonth.getFullYear();
  const month = calMonth.getMonth();
  const firstDayIndex = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();
  const prevMonthTotal = new Date(year, month, 0).getDate();

  // Dias do mês anterior para preenchimento
  let cellsHtml = '';
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const prevDay = prevMonthTotal - i;
    cellsHtml += `<div class="cal-cell other-month">${prevDay}</div>`;
  }

  // Dias do mês atual
  for (let d = 1; d <= totalDays; d++) {
    const dateStr = iso(new Date(year, month, d));
    const events = (S.tasks || []).filter(t => t.d === dateStr);
    const isToday = dateStr === TODAY;
    const isSelected = dateStr === calSel;

    cellsHtml += `
      <button class="cal-cell ${isToday ? 'is-today' : ''} ${isSelected ? 'selected' : ''}" data-cal-day="${dateStr}" aria-label="${d} de ${MES[month]}">
        <span class="cell-num">${d}</span>
        <div class="cell-dots">
          ${events.slice(0, 4).map(e => `
            <span class="cat-dot" style="background:${KC[e.k] || KC.outro}" title="${KIND[e.k] || 'Outro'}: ${esc(e.t)}"></span>
          `).join('')}
        </div>
      </button>
    `;
  }

  // Preenche o final da grade até completar múltiplos de 7
  const totalFilled = firstDayIndex + totalDays;
  const remaining = (7 - (totalFilled % 7)) % 7;
  for (let d = 1; d <= remaining; d++) {
    cellsHtml += `<div class="cal-cell other-month">${d}</div>`;
  }

  // Compromissos do dia selecionado
  const selectedDayEvents = (S.tasks || [])
    .filter(t => t.d === calSel)
    .sort((a, b) => (a.h || '').localeCompare(b.h || ''));

  return `
    <div class="view-header">
      <div>
        <h1>Calendário Acadêmico</h1>
        <p class="sub">Acompanhe datas de provas, trabalhos, apresentações e prazos importantes.</p>
      </div>
      <div class="header-actions">
        <button class="btn" data-add="task">${ic('plus')}Novo Compromisso</button>
      </div>
    </div>

    <div class="calendar-layout">
      <!-- Grade Mensal -->
      <div class="card cal-card">
        <div class="cal-month-nav">
          <div class="cal-month-title">
            <h2>${MES[month]} de ${year}</h2>
          </div>
          <div class="cal-nav-buttons">
            <button class="btn-icon" data-cal-prev title="Mês anterior">${ic('left')}</button>
            <button class="btn ghost sm" data-cal-today>Hoje</button>
            <button class="btn-icon" data-cal-next title="Próximo mês">${ic('right')}</button>
          </div>
        </div>

        <div class="cal-weekdays-row">
          ${DS.map(w => `<span class="cal-weekday">${w}</span>`).join('')}
        </div>

        <div class="cal-grid">
          ${cellsHtml}
        </div>

        <!-- Legenda de Categorias Coloridas (Item 4.C) -->
        <div class="cal-legend">
          ${KINDS.map(([k, label]) => `
            <div class="legend-item">
              <span class="cat-dot" style="background:${KC[k]}"></span>
              <span>${label}</span>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Detalhes do Dia Selecionado -->
      <div class="card cal-details-card">
        <div class="card-header">
          <div>
            <h2>${wd(calSel)}, ${fdLong(calSel)}</h2>
            <p class="sub">${selectedDayEvents.length} compromisso${selectedDayEvents.length !== 1 ? 's' : ''} registrado${selectedDayEvents.length !== 1 ? 's' : ''}</p>
          </div>
          <button class="btn ghost sm" data-add-event-day="${calSel}">
            ${ic('plus')}Adicionar neste dia
          </button>
        </div>

        <div class="card-list">
          ${selectedDayEvents.length > 0 
            ? selectedDayEvents.map(taskRow).join('') 
            : emptyState('Dia sem compromissos', 'Nenhum evento registrado nesta data.', 'task', 'Registrar Evento')}
        </div>
      </div>
    </div>
  `;
}

// ==========================================
// 6. CONFIGURAÇÕES
// ==========================================
function vSettings() {
  return `
    <div class="view-header">
      <div>
        <h1>Configurações</h1>
        <p class="sub">Personalize seu perfil, parâmetros do Modo Foco e preferências da plataforma.</p>
      </div>
    </div>

    <div class="settings-grid">
      <!-- Cartão de Perfil do Estudante -->
      <div class="card settings-card">
        <div class="card-header">
          <h2>Perfil do Estudante</h2>
        </div>
        <div class="profile-preview">
          <div class="avatar-large">${esc((S.name[0] || 'E').toUpperCase())}</div>
          <div class="profile-info">
            <h3>${esc(S.name)}</h3>
            <span class="sub">Estudante · Protótipo Acadêmico</span>
          </div>
          <button class="btn ghost sm" data-edit-name>${ic('edit')}Editar Nome</button>
        </div>
      </div>

      <!-- Configuração de Tempos do Modo Foco -->
      <div class="card settings-card">
        <div class="card-header">
          <h2>Parâmetros do Modo Foco (Pomodoro)</h2>
        </div>
        <div class="settings-row-item">
          <div>
            <b>Tempo Padrão de Concentração</b>
            <p class="sub">Duração da sessão de foco profundo.</p>
          </div>
          <div class="settings-val-badge"><b>${S.fm || 25}</b> min</div>
        </div>
        <div class="settings-row-item">
          <div>
            <b>Tempo Padrão de Descanso</b>
            <p class="sub">Pausa curta recomendada entre os ciclos.</p>
          </div>
          <div class="settings-val-badge"><b>${S.bm || 5}</b> min</div>
        </div>
        <div class="card-footer-action">
          <button class="btn ghost sm" data-edit-focus>${ic('focus')}Ajustar Tempos</button>
        </div>
      </div>

      <!-- Preferências do Sistema -->
      <div class="card settings-card">
        <div class="card-header">
          <h2>Preferências do Aplicativo</h2>
        </div>
        <div class="settings-row-item">
          <div>
            <b>Lembretes e Avisos Internos</b>
            <p class="sub">Exibir alertas de prazos na tela inicial e no calendário.</p>
          </div>
          <button class="switch-btn" role="switch" aria-checked="${!!S.rem}" data-toggle-rem></button>
        </div>
        <div class="settings-row-item">
          <div>
            <b>Armazenamento Local</b>
            <p class="sub">Dados mantidos com segurança diretamente no navegador via LocalStorage.</p>
          </div>
          <span class="tag ok">Operacional</span>
        </div>
      </div>

      <!-- Gerenciamento de Dados de Demonstração -->
      <div class="card settings-card danger-zone">
        <div class="card-header">
          <h2>Dados da Demonstração</h2>
        </div>
        <p class="sub" style="margin-bottom:14px">
          Você pode restaurar a qualquer momento os dados de exemplo pré-configurados para demonstrar a plataforma a avaliadores.
        </p>
        <div class="actions-group-inline">
          <button class="btn ghost sm" data-restore-demo>
            ${ic('reset')}Restaurar Dados de Demonstração
          </button>
          <button class="btn ghost sm danger" data-clear-all>
            ${ic('trash')}Limpar Todos os Dados
          </button>
        </div>
      </div>

      <!-- Nota de Apresentação Acadêmica -->
      <div class="prototype-notice-box">
        <b>Sobre este protótipo:</b>
        <p>O <b>StudyFlow</b> foi projetado para oferecer uma simulação completa e interativa da experiência de um estudante na gestão do seu tempo, notas e concentração. Todas as alterações feitas persistem no navegador.</p>
      </div>
    </div>
  `;
}
