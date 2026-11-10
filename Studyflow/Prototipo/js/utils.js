// Utilitários de interface, datas, ícones e navegação do StudyFlow
const $ = (s, e = document) => e.querySelector(s);
const $$ = (s, e = document) => [...e.querySelectorAll(s)];

// Ícones SVG minimalistas e profissionais (estilo Lucide / Feather)
const IC = {
  home: '<path d="M3 10.5L12 3l9 7.5v10a1.5 1.5 0 01-1.5 1.5h-5a1.5 1.5 0 01-1.5-1.5v-5h-4v5A1.5 1.5 0 017.5 22h-5A1.5 1.5 0 011 20.5v-10z"/>',
  sched: '<circle cx="12" cy="12" r="9"/><polyline points="12 6 12 12 16 14"/>',
  calendar: '<rect x="3" y="4" width="18" height="17" rx="3"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>',
  grades: '<path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12.5v4.5c3 3 9 3 12 0v-4.5"/>',
  focus: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/><line x1="12" y1="2" x2="12" y2="5"/><line x1="12" y1="19" x2="12" y2="22"/><line x1="2" y1="12" x2="5" y2="12"/><line x1="19" y1="12" x2="22" y2="12"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>',
  plus: '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>',
  chk: '<polyline points="20 6 9 17 4 12"/>',
  bell: '<path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/>',
  edit: '<path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>',
  trash: '<polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/>',
  reset: '<path d="M1 4v6h6"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/>',
  play: '<polygon points="5 3 19 12 5 21 5 3"/>',
  pause: '<rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>',
  stop: '<rect x="5" y="5" width="14" height="14" rx="2"/>',
  left: '<polyline points="15 18 9 12 15 6"/>',
  right: '<polyline points="9 18 15 12 9 6"/>',
  book: '<path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>',
  user: '<path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
  checkCircle: '<path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>',
  alert: '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>',
  trend: '<polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>',
  flame: '<path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 11-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 002.5 3.5z"/>'
};

const ic = n => `<svg class="i" viewBox="0 0 24 24" aria-hidden="true">${IC[n] || IC.book}</svg>`;

// Paleta visual de disciplinas e categorias
const SUB_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#0ea5e9', '#8b5cf6', '#14b8a6', '#f97316'];
const col = s => {
  const list = typeof subNames === 'function' ? subNames() : [];
  const idx = list.indexOf(s);
  return SUB_COLORS[(idx >= 0 ? idx : Math.abs(hash(s))) % SUB_COLORS.length];
};
const hash = s => String(s).split('').reduce((a, c) => a + c.charCodeAt(0), 0);

// Categorias acadêmicas
const KC = {
  prova: '#ef4444',
  trabalho: '#f59e0b',
  apresentacao: '#8b5cf6',
  atividade: '#0ea5e9',
  outro: '#64748b'
};

const KINDS = [
  ['prova', 'Prova', 'alert'],
  ['trabalho', 'Trabalho', 'book'],
  ['apresentacao', 'Apresentação', 'trend'],
  ['atividade', 'Atividade', 'checkCircle'],
  ['outro', 'Outro', 'plus']
];
const KIND = Object.fromEntries(KINDS.map(k => [k[0], k[1]]));

// Manipulação de Datas
const iso = d => {
  const x = new Date(d);
  return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`;
};

const addD = n => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return iso(d);
};

const TODAY = iso(new Date());

const MES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
const MES_ABR = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
const DS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const DS_COMPLETO = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];

const wd = s => DS_COMPLETO[new Date(s + 'T12:00').getDay()];
const wdShort = s => DS[new Date(s + 'T12:00').getDay()];

const fd = s => {
  if (!s) return '';
  const [a, b, c] = s.split('-');
  return `${c}/${b}`;
};

const fdLong = s => {
  if (!s) return '';
  const [y, m, d] = s.split('-').map(Number);
  return `${d} de ${MES[m - 1]} de ${y}`;
};

const endT = x => {
  if (!x.time) return '';
  const [h, m] = x.time.split(':').map(Number);
  const total = h * 60 + m + (x.dur || 0);
  return `${String(Math.floor(total / 60) % 24).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
};

const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const fmt = n => (n === null || n === undefined || isNaN(n) ? '–' : Number(n).toFixed(1).replace('.', ','));

const dueTag = t => {
  if (t.done) return '<span class="tag ok">Concluída</span>';
  const diff = Math.round((new Date(t.d + 'T12:00') - new Date(TODAY + 'T12:00')) / 864e5);
  if (diff < 0) return '<span class="tag bad">Atrasada</span>';
  if (diff === 0) return '<span class="tag bad">Hoje</span>';
  if (diff === 1) return '<span class="tag warn">Amanhã</span>';
  if (diff <= 3) return `<span class="tag warn">em ${diff} dias</span>`;
  return `<span class="tag">em ${diff} dias</span>`;
};

const toast = (msg, type = 'info') => {
  const t = $('#toast');
  if (!t) return;
  t.innerHTML = `<span class="toast-dot ${type}"></span>${esc(msg)}`;
  t.classList.add('on');
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => t.classList.remove('on'), 2500);
};

// Navegação lateral principal com exatamente as 6 seções exigidas no item 3:
// 1. Início
// 2. Cronograma
// 3. Calendário
// 4. Disciplinas e Notas
// 5. Modo Foco
// 6. Configurações
const NAV = [
  ['home', 'Início', 'home'],
  ['sched', 'Cronograma', 'sched'],
  ['calendar', 'Calendário', 'calendar'],
  ['grades', 'Disciplinas e Notas', 'grades'],
  ['focus', 'Modo Foco', 'focus'],
  ['settings', 'Configurações', 'settings']
];

let view = 'home';
let schedMode = 'day'; // 'day' | 'week'
let selDay = TODAY;
let calMonth = new Date();
let calSel = TODAY;

function drawNav() {
  const pendingCount = (S.tasks || []).filter(t => !t.done).length;
  const navHtml = `
    <div class="logo">
      <div class="logo-icon">${ic('book')}</div>
      <span>Study<b>Flow</b></span>
    </div>
    <div class="nav-links">
      ${NAV.map(([k, label, iconName]) => {
        const isActive = view === k;
        const badge = (k === 'calendar' || k === 'sched') && pendingCount > 0
          ? '' : '';
        return `
          <button data-go="${k}" class="nav-item ${isActive ? 'active' : ''}" aria-current="${isActive ? 'page' : 'false'}">
            ${ic(iconName)}
            <span class="nav-label">${label}</span>
            ${badge}
          </button>
        `;
      }).join('')}
    </div>
    <div class="nav-footer">
      <button class="nav-user" data-go="settings" title="Ver configurações de ${esc(S.name)}">
        <div class="nav-avatar">${esc((S.name[0] || 'E').toUpperCase())}</div>
        <div class="nav-user-info">
          <b>${esc(S.name)}</b>
          <span>Estudante</span>
        </div>
        ${ic('right')}
      </button>
    </div>
  `;
  $('#nav').innerHTML = navHtml;
}

function go(v) {
  view = v;
  drawNav();
  render();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

const emptyState = (title, desc, btnAction = null, btnLabel = null, btnIcon = 'plus') => `
  <div class="empty-state">
    <div class="empty-icon">${ic('book')}</div>
    <h3>${esc(title)}</h3>
    <p>${esc(desc)}</p>
    ${btnAction && btnLabel ? `<button class="btn btn-sm" data-add="${btnAction}">${ic(btnIcon)}${esc(btnLabel)}</button>` : ''}
  </div>
`;
