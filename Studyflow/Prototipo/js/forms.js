// Módulo de Modais e Formulários Interativos do StudyFlow
function dlg(title, fieldsHtml, onOk) {
  const d = $('#dlg');
  if (!d) return;

  d.innerHTML = `
    <form method="dialog" class="modal-form" novalidate>
      <div class="modal-header">
        <h2>${esc(title)}</h2>
        <button type="button" class="btn-icon modal-close" data-close aria-label="Fechar">&times;</button>
      </div>
      <div class="modal-body">
        ${fieldsHtml}
        <div class="form-error" id="formErr" role="alert"></div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn ghost" data-close>Cancelar</button>
        <button type="submit" class="btn">Salvar</button>
      </div>
    </form>
  `;

  const form = d.querySelector('form');
  form.onsubmit = e => {
    e.preventDefault();
    const formData = Object.fromEntries(new FormData(form));
    const error = onOk(formData);
    const errEl = $('#formErr');
    if (error) {
      if (errEl) errEl.textContent = error;
      return;
    }
    d.close();
    render();
  };

  d.showModal();
}

const subOpts = selected => {
  const list = typeof subNames === 'function' ? subNames() : [];
  return '<option value="">Sem disciplina vinculada</option>' + 
    list.map(n => `<option value="${esc(n)}" ${n === selected ? 'selected' : ''}>${esc(n)}</option>`).join('');
};

function openForm(type, id = null, extraParam = null) {
  // 1. TAREFA / COMPROMISSO ACADÊMICO
  if (type === 'task') {
    const isEdit = !!id;
    const item = (S.tasks || []).find(a => a.id == id) || {
      k: extraParam || 'prova',
      t: '',
      s: '',
      d: view === 'calendar' ? calSel : (view === 'sched' ? selDay : TODAY),
      h: '09:00',
      p: 'Média',
      x: ''
    };

    dlg(
      isEdit ? 'Editar Compromisso' : 'Novo Compromisso / Tarefa',
      `
        <div class="form-group">
          <label class="form-label">Categoria do Evento</label>
          <div class="kinds-selector" role="radiogroup">
            ${KINDS.map(([k, label, iconName]) => `
              <label class="kind-chip">
                <input type="radio" name="k" value="${k}" ${k === item.k ? 'checked' : ''}>
                <span class="chip-content" style="--c:${KC[k]}">
                  ${ic(iconName)}
                  <span>${label}</span>
                </span>
              </label>
            `).join('')}
          </div>
        </div>

        <div class="form-group">
          <label class="form-label" for="taskTitle">Título do compromisso</label>
          <input id="taskTitle" name="t" value="${esc(item.t)}" placeholder="Ex.: Prova Bimestral, Redação, Lista..." required autofocus>
        </div>

        <div class="form-group">
          <label class="form-label" for="taskSub">Disciplina</label>
          <select id="taskSub" name="s">
            ${subOpts(item.s)}
          </select>
        </div>

        <div class="form-row-two">
          <div class="form-group">
            <label class="form-label" for="taskDate">Data</label>
            <input id="taskDate" type="date" name="d" value="${item.d || TODAY}" required>
          </div>
          <div class="form-group">
            <label class="form-label" for="taskTime">Horário (opcional)</label>
            <input id="taskTime" type="time" name="h" value="${item.h || ''}">
          </div>
        </div>

        <div class="form-group">
          <label class="form-label" for="taskPri">Prioridade</label>
          <select id="taskPri" name="p">
            ${['Alta', 'Média', 'Baixa'].map(p => `<option value="${p}" ${p === item.p ? 'selected' : ''}>${p}</option>`).join('')}
          </select>
        </div>

        <div class="form-group">
          <label class="form-label" for="taskDesc">Descrição ou anotações (opcional)</label>
          <textarea id="taskDesc" name="x" rows="2" placeholder="Conteúdos que vão cair, regras, links...">${esc(item.x || '')}</textarea>
        </div>
      `,
      f => {
        if (!f.t.trim()) return 'Por favor, informe o título do compromisso.';
        if (!f.d) return 'Por favor, selecione a data do compromisso.';

        const obj = {
          t: f.t.trim(),
          s: f.s || 'Geral',
          d: f.d,
          h: f.h || '',
          k: f.k || 'outro',
          p: f.p || 'Média',
          x: (f.x || '').trim()
        };

        if (isEdit) {
          const target = S.tasks.find(a => a.id == id);
          if (target) Object.assign(target, obj);
          toast('Compromisso atualizado com sucesso!', 'ok');
        } else {
          S.tasks.push({
            id: Date.now(),
            done: false,
            ...obj
          });
          toast('Novo compromisso registrado com sucesso!', 'ok');
        }
        save();
        return null;
      }
    );
  }

  // 2. ATIVIDADE DO CRONOGRAMA DE ESTUDO
  if (type === 'sched') {
    const isEdit = !!id;
    const item = (S.sched || []).find(a => a.id == id) || {
      day: selDay || TODAY,
      time: '09:00',
      dur: 60,
      s: '',
      t: '',
      x: ''
    };

    dlg(
      isEdit ? 'Editar Bloco de Estudo' : 'Nova Atividade no Cronograma',
      `
        <div class="form-group">
          <label class="form-label" for="schedTitle">O que estudar?</label>
          <input id="schedTitle" name="t" value="${esc(item.t)}" placeholder="Ex.: Resolução de exercícios, Leitura de capítulo..." required autofocus>
        </div>

        <div class="form-group">
          <label class="form-label" for="schedSub">Disciplina</label>
          <select id="schedSub" name="s">
            ${subOpts(item.s)}
          </select>
        </div>

        <div class="form-group">
          <label class="form-label" for="schedDate">Data do estudo</label>
          <input id="schedDate" type="date" name="d" value="${item.day || TODAY}" required>
        </div>

        <div class="form-row-two">
          <div class="form-group">
            <label class="form-label" for="schedTime">Horário de início</label>
            <input id="schedTime" type="time" name="time" value="${item.time || '09:00'}" required>
          </div>
          <div class="form-group">
            <label class="form-label" for="schedDur">Duração (minutos)</label>
            <input id="schedDur" type="number" name="dur" min="5" max="600" step="5" value="${item.dur || 60}" required>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label" for="schedDesc">Descrição ou metas da sessão (opcional)</label>
          <textarea id="schedDesc" name="x" rows="2" placeholder="Ex.: Fazer páginas 40 a 55, anotar dúvidas...">${esc(item.x || '')}</textarea>
        </div>
      `,
      f => {
        const dur = parseInt(f.dur, 10);
        if (!f.t.trim()) return 'Informe a atividade que será realizada.';
        if (!f.d) return 'Escolha a data do estudo.';
        if (!f.time) return 'Defina o horário de início.';
        if (isNaN(dur) || dur < 5 || dur > 600) return 'A duração deve ficar entre 5 e 600 minutos.';

        const obj = {
          day: f.d,
          time: f.time,
          dur: dur,
          s: f.s || 'Geral',
          t: f.t.trim(),
          x: (f.x || '').trim()
        };

        if (isEdit) {
          const target = S.sched.find(a => a.id == id);
          if (target) Object.assign(target, obj);
          toast('Atividade do cronograma atualizada!', 'ok');
        } else {
          S.sched.push({
            id: Date.now(),
            done: false,
            ...obj
          });
          toast('Atividade adicionada ao cronograma!', 'ok');
        }
        selDay = f.d;
        save();
        return null;
      }
    );
  }

  // 3. DISCIPLINA
  if (type === 'subj') {
    const isEdit = !!id;
    const sb = isEdit ? subOf(id) : { n: '', c: 'simple', max: 10, pass: 7 };
    if (isEdit && !sb) return;

    dlg(
      isEdit ? `Configurar Disciplina: ${esc(sb.n)}` : 'Cadastrar Nova Disciplina',
      `
        <div class="form-group">
          <label class="form-label" for="subName">Nome da Disciplina</label>
          <input id="subName" name="n" value="${esc(sb.n)}" placeholder="Ex.: Matemática, Física, Biologia..." required autofocus>
        </div>

        <div class="form-group">
          <label class="form-label" for="subCrit">Critério de Avaliação</label>
          <select id="subCrit" name="c">
            ${Object.entries(CRIT).map(([val, label]) => `
              <option value="${val}" ${val === sb.c ? 'selected' : ''}>${label}</option>
            `).join('')}
          </select>
          <small class="form-hint">Você pode escolher Média Simples, Média Ponderada com pesos por avaliação ou Soma direta de pontos.</small>
        </div>

        <div class="form-row-two">
          <div class="form-group">
            <label class="form-label" for="subMax">Nota Máxima da Disciplina</label>
            <input id="subMax" name="max" type="number" step="0.5" min="1" max="1000" value="${sb.max}" required>
          </div>
          <div class="form-group">
            <label class="form-label" for="subPass">Mínimo para Aprovação</label>
            <input id="subPass" name="pass" type="number" step="0.5" min="0" max="1000" value="${sb.pass}" required>
          </div>
        </div>
      `,
      f => {
        const name = f.n.trim();
        const max = parseFloat(f.max);
        const pass = parseFloat(f.pass);

        if (!name) return 'Informe o nome da disciplina.';
        if (S.subjects.some(x => x.n.toLowerCase() === name.toLowerCase() && x.n !== id)) {
          return 'Já existe uma disciplina cadastrada com esse nome.';
        }
        if (isNaN(max) || max <= 0) return 'A nota máxima deve ser maior que zero.';
        if (isNaN(pass) || pass < 0 || pass > max) {
          return 'A nota mínima para aprovação deve estar entre 0 e a nota máxima.';
        }

        if (isEdit) {
          const oldName = id;
          if (oldName !== name) {
            S.grades[name] = S.grades[oldName] || [];
            delete S.grades[oldName];
            S.tasks.forEach(t => { if (t.s === oldName) t.s = name; });
            S.sched.forEach(s => { if (s.s === oldName) s.s = name; });
          }
          Object.assign(sb, { n: name, c: f.c, max, pass });
          toast(`Disciplina ${name} atualizada!`, 'ok');
        } else {
          S.subjects.push({ n: name, c: f.c, max, pass });
          S.grades[name] = [];
          toast(`Disciplina ${name} cadastrada com sucesso!`, 'ok');
        }
        save();
        return null;
      }
    );
  }

  // 4. REGISTRAR / EDITAR NOTA
  if (type === 'grade') {
    if (!S.subjects || !S.subjects.length) {
      toast('Cadastre pelo menos uma disciplina antes de lançar notas.', 'warn');
      openForm('subj');
      return;
    }

    let cur = null;
    let currentSub = extraParam || S.subjects[0].n;

    if (id) {
      for (const sb of S.subjects) {
        const found = (S.grades[sb.n] || []).find(a => a.id == id);
        if (found) {
          cur = found;
          currentSub = sb.n;
          break;
        }
      }
    }

    const g = cur || { t: '', v: '', w: 1, d: TODAY };
    const selectedSubject = subOf(currentSub) || S.subjects[0];

    dlg(
      id ? 'Editar Avaliação' : 'Registrar Nova Avaliação',
      `
        <div class="form-group">
          <label class="form-label" for="gradeSub">Disciplina</label>
          <select id="gradeSub" name="s">
            ${S.subjects.map(sb => `
              <option value="${esc(sb.n)}" ${sb.n === currentSub ? 'selected' : ''}>
                ${esc(sb.n)} (${CRIT[sb.c]})
              </option>
            `).join('')}
          </select>
        </div>

        <div class="form-group">
          <label class="form-label" for="gradeTitle">Nome da Avaliação</label>
          <input id="gradeTitle" name="t" value="${esc(g.t)}" placeholder="Ex.: Prova 1, Seminário, Relatório..." required autofocus>
        </div>

        <div class="form-row-two">
          <div class="form-group">
            <label class="form-label" for="gradeValue">Nota Obtida</label>
            <input id="gradeValue" name="v" type="number" step="0.1" min="0" value="${g.v !== '' ? g.v : ''}" placeholder="Ex.: 8.5" required>
          </div>
          <div class="form-group" id="weightGroup">
            <label class="form-label" for="gradeWeight">Peso (se ponderada)</label>
            <input id="gradeWeight" name="w" type="number" step="0.1" min="0.1" value="${g.w || 1}">
          </div>
        </div>

        <div class="form-group">
          <label class="form-label" for="gradeDate">Data da Avaliação</label>
          <input id="gradeDate" type="date" name="d" value="${g.d || TODAY}" required>
        </div>
      `,
      f => {
        const sb = subOf(f.s);
        if (!sb) return 'Selecione uma disciplina válida.';
        const v = parseFloat(f.v);
        const w = parseFloat(f.w || 1);

        if (!f.t.trim()) return 'Informe o nome da avaliação.';
        if (isNaN(v) || v < 0) return 'Informe uma nota válida maior ou igual a zero.';
        if (v > sb.max) return `A nota obtida (${fmt(v)}) não pode ser superior à nota máxima (${fmt(sb.max)}) de ${sb.n}.`;
        if (isNaN(w) || w <= 0) return 'O peso da avaliação deve ser maior que zero.';

        // Se trocou de disciplina na edição, remove da anterior
        if (cur && currentSub !== f.s) {
          S.grades[currentSub] = (S.grades[currentSub] || []).filter(a => a.id != cur.id);
        }

        const gradeObj = {
          t: f.t.trim(),
          v: v,
          w: w,
          d: f.d || TODAY
        };

        S.grades[f.s] = S.grades[f.s] || [];
        if (cur && currentSub === f.s) {
          Object.assign(cur, gradeObj);
          toast('Avaliação atualizada com sucesso!', 'ok');
        } else {
          S.grades[f.s].push({
            id: cur ? cur.id : Date.now(),
            ...gradeObj
          });
          toast('Nota registrada com sucesso!', 'ok');
        }

        save();
        return null;
      }
    );
  }

  // 5. CONFIGURAR MODO FOCO
  if (type === 'foco') {
    dlg(
      'Configurações Padrão do Modo Foco',
      `
        <div class="form-row-two">
          <div class="form-group">
            <label class="form-label" for="focoFm">Foco (minutos)</label>
            <input id="focoFm" name="fm" type="number" min="1" max="120" value="${S.fm || 25}" required>
          </div>
          <div class="form-group">
            <label class="form-label" for="focoBm">Descanso (minutos)</label>
            <input id="focoBm" name="bm" type="number" min="1" max="60" value="${S.bm || 5}" required>
          </div>
        </div>
        <small class="form-hint">O padrão recomendado pela técnica Pomodoro clássica é 25 minutos de foco e 5 de descanso.</small>
      `,
      f => {
        const fm = parseInt(f.fm, 10);
        const bm = parseInt(f.bm, 10);
        if (isNaN(fm) || fm < 1 || fm > 120) return 'Tempo de foco deve ficar entre 1 e 120 minutos.';
        if (isNaN(bm) || bm < 1 || bm > 60) return 'Tempo de descanso deve ficar entre 1 e 60 minutos.';

        S.fm = fm;
        S.bm = bm;
        stopT();
        P.ph = 'f';
        P.left = 0;
        save();
        toast('Tempos do Modo Foco atualizados!', 'ok');
        return null;
      }
    );
  }

  // 6. ALTERAR NOME DO ESTUDANTE
  if (type === 'name') {
    dlg(
      'Alterar Nome do Estudante',
      `
        <div class="form-group">
          <label class="form-label" for="studName">Seu nome ou como prefere ser chamado</label>
          <input id="studName" name="n" value="${esc(S.name)}" placeholder="Ex.: Lucas, Maria, Carlos..." required autofocus>
        </div>
      `,
      f => {
        const n = f.n.trim();
        if (!n) return 'Por favor, informe seu nome.';
        S.name = n;
        save();
        drawNav();
        toast('Nome atualizado com sucesso!', 'ok');
        return null;
      }
    );
  }
}
