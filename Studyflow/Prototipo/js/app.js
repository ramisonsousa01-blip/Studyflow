// Controlador Principal de Eventos e Roteamento do StudyFlow
const V = {
  home: vHome,
  sched: vSched,
  calendar: vCalendar,
  grades: vGrades,
  focus: vFocus,
  settings: vSettings
};

function render() {
  const mainEl = $('#main');
  if (!mainEl) return;

  // Aplica classe de imersão escura apenas quando estiver no Modo Foco
  document.body.classList.toggle('focus-mode-active', view === 'focus');

  // Renderiza a view ativa
  if (typeof V[view] === 'function') {
    mainEl.innerHTML = V[view]();
  } else {
    view = 'home';
    mainEl.innerHTML = V.home();
  }

  // Atualiza temporizador se a tela for foco
  if (view === 'focus') {
    tick();
  }
}

// Manipulador global de cliques
document.addEventListener('click', e => {
  const target = e.target.closest('button, [data-go], [data-tog], [data-sdone], [data-cal-day], [data-sel-day]');
  if (!target) return;
  const d = target.dataset;

  // 1. Navegação entre telas
  if (d.go) {
    go(d.go);
    return;
  }

  // 2. Modais
  if (d.close !== undefined) {
    const dlgEl = $('#dlg');
    if (dlgEl) dlgEl.close();
    return;
  }

  // 3. Tarefas e Compromissos
  if (d.tog) {
    const task = (S.tasks || []).find(a => a.id == d.tog);
    if (task) {
      task.done = !task.done;
      save();
      render();
      toast(task.done ? 'Tarefa marcada como concluída! Parabéns!' : 'Tarefa desmarcada.', 'ok');
    }
    return;
  }

  if (d.deltask) {
    if (confirm('Tem certeza de que deseja excluir este compromisso?')) {
      S.tasks = (S.tasks || []).filter(a => a.id != d.deltask);
      save();
      render();
      toast('Compromisso excluído com sucesso.', 'info');
    }
    return;
  }

  if (d.edittask) {
    openForm('task', d.edittask);
    return;
  }

  // 4. Cronograma de Estudos
  if (d.sdone) {
    const item = (S.sched || []).find(a => a.id == d.sdone);
    if (item) {
      item.done = !item.done;
      save();
      render();
      toast(item.done ? 'Estudo concluído! Ótimo trabalho!' : 'Estudo reaberto.', 'ok');
    }
    return;
  }

  if (d.delsch) {
    if (confirm('Deseja excluir esta atividade de estudo?')) {
      S.sched = (S.sched || []).filter(a => a.id != d.delsch);
      save();
      render();
      toast('Atividade de estudo excluída.', 'info');
    }
    return;
  }

  if (d.editsch) {
    openForm('sched', d.editsch);
    return;
  }

  if (d.schedMode) {
    schedMode = d.schedMode;
    render();
    return;
  }

  if (d.selDay) {
    selDay = d.selDay;
    render();
    return;
  }

  if (d.wk) {
    const base = new Date(selDay + 'T12:00');
    base.setDate(base.getDate() + parseInt(d.wk, 10));
    selDay = iso(base);
    render();
    return;
  }

  if (d.today !== undefined) {
    selDay = TODAY;
    render();
    return;
  }

  if (d.addDay) {
    selDay = d.addDay;
    openForm('sched');
    return;
  }

  // 5. Calendário
  if (d.calDay) {
    calSel = d.calDay;
    render();
    return;
  }

  if (d.calPrev !== undefined) {
    calMonth = new Date(calMonth.getFullYear(), calMonth.getMonth() - 1, 1);
    render();
    return;
  }

  if (d.calNext !== undefined) {
    calMonth = new Date(calMonth.getFullYear(), calMonth.getMonth() + 1, 1);
    render();
    return;
  }

  if (d.calToday !== undefined) {
    calMonth = new Date();
    calSel = TODAY;
    render();
    return;
  }

  if (d.addEventDay) {
    calSel = d.addEventDay;
    openForm('task');
    return;
  }

  // 6. Disciplinas e Notas
  if (d.addToSub) {
    openForm('grade', null, d.addToSub);
    return;
  }

  if (d.esub) {
    openForm('subj', d.esub);
    return;
  }

  if (d.dsub) {
    if (confirm(`Tem certeza de que deseja excluir a disciplina "${d.dsub}" e todas as suas notas cadastradas?`)) {
      S.subjects = (S.subjects || []).filter(x => x.n !== d.dsub);
      if (S.grades) delete S.grades[d.dsub];
      save();
      render();
      toast('Disciplina e notas excluídas.', 'info');
    }
    return;
  }

  if (d.eg) {
    openForm('grade', d.eg);
    return;
  }

  if (d.dg) {
    if (confirm('Tem certeza de que deseja excluir esta nota de avaliação?')) {
      for (const k in S.grades) {
        S.grades[k] = (S.grades[k] || []).filter(a => a.id != d.dg);
      }
      save();
      render();
      toast('Avaliação excluída.', 'info');
    }
    return;
  }

  // 7. Abertura de Formulários Genéricos
  if (d.add) {
    openForm(d.add);
    return;
  }

  if (d.addProva !== undefined) {
    openForm('task', null, 'prova');
    return;
  }

  // 8. Modo Foco (Pomodoro)
  if (d.focusMode) {
    P.cust = d.focusMode === 'custom';
    if (!P.cust) {
      S.fm = 25;
      S.bm = 5;
      save();
    }
    stopT();
    P.ph = 'f';
    P.left = getFocusDur();
    render();
    return;
  }

  if (d.fp !== undefined) {
    if (P.run) stopT();
    else startT();
    tick();
    return;
  }

  if (d.fr !== undefined) {
    stopT();
    P.left = getFocusDur();
    tick();
    toast('Temporizador reiniciado.', 'info');
    return;
  }

  if (d.fs !== undefined) {
    stopT();
    P.ph = 'f';
    P.left = getFocusDur();
    tick();
    toast('Ciclo encerrado.', 'info');
    return;
  }

  // 9. Configurações
  if (d.editName !== undefined) {
    openForm('name');
    return;
  }

  if (d.editFocus !== undefined) {
    openForm('foco');
    return;
  }

  if (d.toggleRem !== undefined) {
    S.rem = !S.rem;
    save();
    render();
    toast(S.rem ? 'Lembretes internos ativados.' : 'Lembretes desativados.', 'info');
    return;
  }

  if (d.restoreDemo !== undefined) {
    if (confirm('Deseja restaurar todos os dados de demonstração originais do StudyFlow? As alterações atuais serão substituídas pelos dados de exemplo.')) {
      S = Store.reset();
      drawNav();
      go('home');
      toast('Dados de demonstração restaurados com sucesso!', 'ok');
    }
    return;
  }

  if (d.clearAll !== undefined) {
    if (confirm('ATENÇÃO: Deseja apagar todos os registros (disciplinas, notas, tarefas e cronograma)? Esta ação é irreversível.')) {
      S.subjects = [];
      S.grades = {};
      S.tasks = [];
      S.sched = [];
      S.sessions = [];
      S.mins = 0;
      S.cycles = 0;
      save();
      drawNav();
      render();
      toast('Todos os dados foram apagados.', 'info');
    }
    return;
  }
});

// Manipulador de alterações em selects e inputs
document.addEventListener('change', e => {
  const target = e.target;
  if (!target) return;

  if (target.id === 'fsub') {
    P.sub = target.value;
    return;
  }

  if (target.id === 'fm') {
    S.fm = parseInt(target.value, 10);
    stopT();
    P.ph = 'f';
    P.left = getFocusDur();
    save();
    render();
    return;
  }

  if (target.id === 'bm') {
    S.bm = parseInt(target.value, 10);
    stopT();
    if (P.ph === 'b') P.left = getFocusDur();
    save();
    render();
    return;
  }
});

// Inicialização da aplicação
drawNav();
render();
