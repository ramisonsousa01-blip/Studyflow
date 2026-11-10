// Gerenciamento de estado e persistência LocalStorage para o StudyFlow
const STORE_KEY = 'studyflow_v5';

// Gera dados de demonstração completos, realistas e funcionais
const createDemoData = () => ({
  v: 5,
  name: 'Ramison',
  welcomed: true,
  demo: true,
  rem: true,
  fm: 25, // Tempo de foco padrão (minutos)
  bm: 5,  // Tempo de descanso padrão (minutos)
  cycles: 2,
  mins: 50,
  mday: TODAY,
  sessions: [
    { d: TODAY, m: 25, s: 'Matemática' },
    { d: TODAY, m: 25, s: 'Física' }
  ],
  subjects: [
    { n: 'Matemática', c: 'weighted', max: 10, pass: 7.0 },
    { n: 'Português', c: 'simple', max: 10, pass: 7.0 },
    { n: 'História', c: 'simple', max: 10, pass: 7.0 },
    { n: 'Biologia', c: 'weighted', max: 10, pass: 7.0 },
    { n: 'Física', c: 'simple', max: 10, pass: 7.0 },
    { n: 'Química', c: 'sum', max: 30, pass: 18.0 }
  ],
  tasks: [
    { id: 1, t: 'Prova Bimestral de Matemática', s: 'Matemática', d: addD(2), h: '08:00', k: 'prova', p: 'Alta', x: 'Conteúdo: Matrizes, determinantes e sistemas lineares.', done: false },
    { id: 2, t: 'Entrega do Trabalho de História', s: 'História', d: addD(1), h: '23:59', k: 'trabalho', p: 'Alta', x: 'Pesquisa sobre os desdobramentos da Era Vargas.', done: false },
    { id: 3, t: 'Seminário de Biologia Celular', s: 'Biologia', d: addD(5), h: '10:30', k: 'apresentacao', p: 'Média', x: 'Apresentação em slides com o grupo 3.', done: false },
    { id: 4, t: 'Lista de Exercícios de Física', s: 'Física', d: addD(3), h: '18:00', k: 'atividade', p: 'Média', x: 'Capítulo 4: Termodinâmica e calorimetria.', done: false },
    { id: 5, t: 'Redação Dissertativa-Argumentativa', s: 'Português', d: addD(4), h: '14:00', k: 'trabalho', p: 'Média', x: 'Tema ENEM: Desafios da inclusão tecnológica.', done: false },
    { id: 6, t: 'Revisão Geral de Química', s: 'Química', d: TODAY, h: '20:00', k: 'outro', p: 'Baixa', x: 'Leitura das anotações sobre soluções químicas.', done: false }
  ],
  sched: [
    { id: 101, day: TODAY, time: '09:00', dur: 60, s: 'Matemática', t: 'Resolução de exercícios de matrizes', x: 'Focar em questões discursivas anteriores.', done: true },
    { id: 102, day: TODAY, time: '14:00', dur: 90, s: 'Física', t: 'Estudo teórico de Termodinâmica', x: 'Livro texto páginas 82 a 105.', done: false },
    { id: 103, day: TODAY, time: '16:30', dur: 45, s: 'Português', t: 'Treino de estruturação de redação', x: 'Montar esquema de tese e argumentos.', done: false },
    { id: 104, day: TODAY, time: '19:00', dur: 60, s: 'Biologia', t: 'Revisão das organelas celulares', x: 'Elaborar mapa mental de síntese proteica.', done: false },
    { id: 105, day: addD(1), time: '09:00', dur: 90, s: 'História', t: 'Finalização do relatório sobre Era Vargas', x: 'Revisar referências bibliográficas.', done: false },
    { id: 106, day: addD(1), time: '15:00', dur: 60, s: 'Química', t: 'Exercícios de balanceamento químico', x: 'Lista do professor Roberto.', done: false },
    { id: 107, day: addD(2), time: '10:00', dur: 120, s: 'Matemática', t: 'Simulado preparatório para a prova', x: 'Resolver com cronômetro ligado.', done: false }
  ],
  grades: {
    'Matemática': [
      { id: 201, t: 'Prova 1 - Funções e Trigonometria', v: 8.5, w: 2, d: addD(-20) },
      { id: 202, t: 'Trabalho em Dupla - Geometria Espacial', v: 9.0, w: 1, d: addD(-10) }
    ],
    'Português': [
      { id: 203, t: 'Redação Nota 1000 - Modelo ENEM', v: 8.0, w: 1, d: addD(-18) },
      { id: 204, t: 'Prova Mensal de Sintaxe', v: 7.5, w: 1, d: addD(-8) }
    ],
    'História': [
      { id: 205, t: 'Seminário de República Velha', v: 9.5, w: 1, d: addD(-25) },
      { id: 206, t: 'Avaliação Escrita 1', v: 7.0, w: 1, d: addD(-12) }
    ],
    'Biologia': [
      { id: 207, t: 'Relatório Prático de Laboratório', v: 8.5, w: 1, d: addD(-15) },
      { id: 208, t: 'Prova Bimestral de Genética', v: 8.0, w: 2, d: addD(-5) }
    ],
    'Física': [
      { id: 209, t: 'Lista Avaliativa de Mecânica', v: 6.5, w: 1, d: addD(-22) },
      { id: 210, t: 'Prova 1 - Cinemática e Dinâmica', v: 7.5, w: 1, d: addD(-9) }
    ],
    'Química': [
      { id: 211, t: 'Atividade Experimental de pH', v: 8.0, w: 1, d: addD(-19) },
      { id: 212, t: 'Teste de Eletroquímica', v: 9.0, w: 1, d: addD(-14) },
      { id: 213, t: 'Seminário de Tabela Periódica', v: 7.5, w: 1, d: addD(-6) }
    ]
  }
});

const Store = {
  read() {
    try {
      const data = JSON.parse(localStorage.getItem(STORE_KEY));
      return data && data.v === 5 ? data : null;
    } catch (e) {
      console.warn('Erro ao ler LocalStorage:', e);
      return null;
    }
  },
  write(data) {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(data));
      return true;
    } catch (e) {
      console.warn('Erro ao salvar no LocalStorage:', e);
      return false;
    }
  },
  reset() {
    const fresh = createDemoData();
    Store.write(fresh);
    return fresh;
  }
};

let S = Store.read() || Store.reset();

// Reseta o contador diário se for um novo dia de calendário
if (S.mday !== TODAY) {
  S.mday = TODAY;
  S.mins = 0;
  S.cycles = 0;
  Store.write(S);
}

const save = () => {
  if (!Store.write(S)) {
    toast('Atenção: Não foi possível salvar as alterações no navegador.', 'bad');
  }
};
