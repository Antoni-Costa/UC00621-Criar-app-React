/* =====================================================
   Gestor de Escola (VERSÃO ALUNOS) — 50% Starter
   - JS para iniciantes
   - Turmas + UI base já estão feitos
   - Alunos + Notas + Estatísticas ficam para implementar (TODO)
   ===================================================== */

/* -----------------------------
   Estrutura de dados (exemplo)
------------------------------ */
/*
turmas = [
  {
    id: 1,
    nome: "10A",
    ano: 10,
    alunos: [
      { id: 1, nome: "Ana", numero: 3, notas: [12, 15] }
    ]
  }
]
*/

let turmas = [];

// Seleções
let turmaSelecionadaId = null;
let alunoSelecionadoId = null;

// IDs incrementais simples
let proximoIdTurma = 1;
let proximoIdAluno = 1;

/* -----------------------------
   Referências ao DOM
------------------------------ */
const zonaAlertas = document.querySelector("#alertHost");

// Turmas
const formAdicionarTurma = document.querySelector("#formAddClass");
const inputNomeTurma = document.querySelector("#className");
const inputAnoTurma = document.querySelector("#classYear");
const listaTurmas = document.querySelector("#classList");
const badgeTotalTurmas = document.querySelector("#badgeClassCount");
const labelTurmaAtiva = document.querySelector("#activeClassLabel");

// Alunos
const formAdicionarAluno = document.querySelector("#formAddStudent");
const inputNomeAluno = document.querySelector("#studentName");
const inputNumeroAluno = document.querySelector("#studentNumber");
const listaAlunos = document.querySelector("#studentList");
const botaoAdicionarAluno = document.querySelector("#btnAddStudent");

// Notas
const formAdicionarNota = document.querySelector("#formAddGrade");
const inputNota = document.querySelector("#gradeValue");
const botaoAdicionarNota = document.querySelector("#btnAddGrade");
const listaNotas = document.querySelector("#gradeList");
const badgeTotalNotas = document.querySelector("#badgeGradeCount");

// Resumo do aluno
const labelAlunoAtivo = document.querySelector("#activeStudentLabel");
const elMediaAluno = document.querySelector("#studentAverage");
const elSituacaoAluno = document.querySelector("#studentStatus");

// Estatísticas da turma
const botaoRecalcularStats = document.querySelector("#btnRecalcStats");
const statTotal = document.querySelector("#statTotal");
const statAprovados = document.querySelector("#statApproved");
const statReprovados = document.querySelector("#statFailed");
const statSemAvaliacao = document.querySelector("#statNoEval");
const statMediaTurma = document.querySelector("#statClassAvg");
const statMelhorAluno = document.querySelector("#statBest");

/* -----------------------------
   Alertas (Bootstrap)
------------------------------ */
function mostrarAlerta(mensagem, tipo) {
  // tipo: primary, success, warning, danger, info, secondary
  if (!tipo) tipo = "warning";

  zonaAlertas.innerHTML = `
    <div class="alert alert-${tipo} alert-dismissible fade show" role="alert">
      ${mensagem}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Fechar"></button>
    </div>
  `;
}

function limparAlerta() {
  zonaAlertas.innerHTML = "";
}

/* -----------------------------
   Utilitários simples
------------------------------ */
function paraInteiro(valor) {
  const n = Number(valor);
  if (!Number.isFinite(n)) return NaN;
  return Math.trunc(n);
}

function paraNumero(valor) {
  const n = Number(valor);
  if (!Number.isFinite(n)) return NaN;
  return n;
}

function obterTurmaSelecionada() {
  for (let i = 0; i < turmas.length; i++) {
    if (turmas[i].id === turmaSelecionadaId) return turmas[i];
  }
  return null;
}

function obterAlunoSelecionado() {
  const turma = obterTurmaSelecionada();
  if (!turma) return null;

  for (let i = 0; i < turma.alunos.length; i++) {
    if (turma.alunos[i].id === alunoSelecionadoId) return turma.alunos[i];
  }
  return null;
}

/* -----------------------------
   Cálculos (simples)
------------------------------ */
function calcularMediaAluno(aluno) {
  if (!aluno.notas || aluno.notas.length === 0) return null;

  let soma = 0;
  for (let i = 0; i < aluno.notas.length; i++) {
    soma += aluno.notas[i];
  }
  return soma / aluno.notas.length;
}

function calcularSituacaoAluno(aluno) {
  const media = calcularMediaAluno(aluno);
  if (media === null) return "Sem avaliação";
  if (media >= 10) return "Aprovado";
  return "Reprovado";
}

/* -----------------------------
   Renderização (UI) — FEITO
------------------------------ */
function renderizarTudo() {
  renderizarTurmas();
  renderizarAlunos();
  renderizarNotas();
  renderizarResumoAluno();
  renderizarEstatisticasTurma();
  sincronizarControlos();
}

function renderizarTurmas() {
  badgeTotalTurmas.textContent = String(turmas.length);
  listaTurmas.innerHTML = "";

  if (turmas.length === 0) {
    listaTurmas.innerHTML = `<div class="text-muted small">Sem turmas. Cria a primeira turma acima.</div>`;
    labelTurmaAtiva.textContent = "—";
    return;
  }

  for (let i = 0; i < turmas.length; i++) {
    const turma = turmas[i];
    const estaAtiva = turma.id === turmaSelecionadaId;

    const item = document.createElement("button");
    item.type = "button";
    item.className = "list-group-item list-group-item-action d-flex justify-content-between align-items-center";
    if (estaAtiva) item.classList.add("active");

    item.innerHTML = `
      <div class="me-2">
        <div class="fw-semibold">${turma.nome}</div>
        <div class="small ${estaAtiva ? "text-white-50" : "text-muted"}">
          Ano ${turma.ano} • ${turma.alunos.length} aluno(s)
        </div>
      </div>
      <div class="d-flex gap-2">
        <span class="badge ${estaAtiva ? "text-bg-light" : "text-bg-secondary"}">ID ${turma.id}</span>
        <span class="btn btn-sm ${estaAtiva ? "btn-light" : "btn-outline-danger"}"
              data-acao="remover-turma" data-id="${turma.id}">
          Remover
        </span>
      </div>
    `;

    item.addEventListener("click", (ev) => {
      const alvo = ev.target;

      if (alvo && alvo.dataset && alvo.dataset.acao === "remover-turma") {
        ev.stopPropagation();
        const id = paraInteiro(alvo.dataset.id);
        removerTurma(id);
        return;
      }

      selecionarTurma(turma.id);
    });

    listaTurmas.appendChild(item);
  }

  const turmaSelecionada = obterTurmaSelecionada();
  labelTurmaAtiva.textContent = turmaSelecionada ? `${turmaSelecionada.nome} (Ano ${turmaSelecionada.ano})` : "—";
}

function renderizarAlunos() {
  listaAlunos.innerHTML = "";

  const turma = obterTurmaSelecionada();
  if (!turma) {
    listaAlunos.innerHTML = `<div class="text-muted small">Seleciona uma turma para gerir alunos.</div>`;
    return;
  }

  if (turma.alunos.length === 0) {
    listaAlunos.innerHTML = `<div class="text-muted small">Sem alunos nesta turma. Adiciona o primeiro aluno acima.</div>`;
    return;
  }

  for (let i = 0; i < turma.alunos.length; i++) {
    const aluno = turma.alunos[i];
    const estaAtivo = aluno.id === alunoSelecionadoId;

    const media = calcularMediaAluno(aluno);
    const situacao = calcularSituacaoAluno(aluno);

    const item = document.createElement("button");
    item.type = "button";
    item.className = "list-group-item list-group-item-action d-flex justify-content-between align-items-center";
    if (estaAtivo) item.classList.add("active");

    item.innerHTML = `
      <div class="me-2">
        <div class="fw-semibold">${aluno.numero} — ${aluno.nome}</div>
        <div class="small ${estaAtivo ? "text-white-50" : "text-muted"}">
          Média: ${media === null ? "—" : media.toFixed(1)} • ${situacao}
        </div>
      </div>
      <div class="d-flex gap-2">
        <span class="btn btn-sm ${estaAtivo ? "btn-light" : "btn-outline-danger"}"
              data-acao="remover-aluno" data-id="${aluno.id}">
          Remover
        </span>
      </div>
    `;

    item.addEventListener("click", (ev) => {
      const alvo = ev.target;

      if (alvo && alvo.dataset && alvo.dataset.acao === "remover-aluno") {
        ev.stopPropagation();
        const id = paraInteiro(alvo.dataset.id);
        removerAluno(id); // TODO (alunos)
        return;
      }

      selecionarAluno(aluno.id);
    });

    listaAlunos.appendChild(item);
  }
}

function renderizarNotas() {
  listaNotas.innerHTML = "";

  const aluno = obterAlunoSelecionado();
  badgeTotalNotas.textContent = aluno ? String(aluno.notas.length) : "0";

  if (!aluno) {
    listaNotas.innerHTML = `<div class="text-muted small">Seleciona um aluno para gerir notas.</div>`;
    labelAlunoAtivo.textContent = "—";
    return;
  }

  labelAlunoAtivo.textContent = `${aluno.numero} — ${aluno.nome}`;

  if (aluno.notas.length === 0) {
    listaNotas.innerHTML = `<div class="text-muted small">Sem notas. Adiciona uma nota acima.</div>`;
    return;
  }

  for (let i = 0; i < aluno.notas.length; i++) {
    const nota = aluno.notas[i];
    const pill = document.createElement("span");
    pill.className = "badge text-bg-success badge-grade";
    pill.textContent = String(nota);
    listaNotas.appendChild(pill);
  }
}

function renderizarResumoAluno() {
  const aluno = obterAlunoSelecionado();
  if (!aluno) {
    elMediaAluno.textContent = "—";
    elSituacaoAluno.textContent = "—";
    return;
  }

  const media = calcularMediaAluno(aluno);
  elMediaAluno.textContent = media === null ? "—" : media.toFixed(1);
  elSituacaoAluno.textContent = calcularSituacaoAluno(aluno);
}

/* -----------------------------
   Ações de Turmas — FEITO
------------------------------ */
function selecionarTurma(idTurma) {
  turmaSelecionadaId = idTurma;
  alunoSelecionadoId = null;
  limparAlerta();
  renderizarTudo();
}

function selecionarAluno(idAluno) {
  alunoSelecionadoId = idAluno;
  limparAlerta();
  renderizarTudo();
}

function adicionarTurma(nome, ano) {
  if (!nome || !nome.trim()) {
    mostrarAlerta("O nome da turma é obrigatório.", "danger");
    return;
  }

  if (!Number.isFinite(ano) || ano < 10 || ano > 12) {
    mostrarAlerta("O ano da turma deve estar entre 10 e 12.", "danger");
    return;
  }

  const turma = {
    id: proximoIdTurma++,
    nome: nome.trim(),
    ano: ano,
    alunos: [],
  };

  turmas.push(turma);

  turmaSelecionadaId = turma.id;
  alunoSelecionadoId = null;

  limparAlerta();
  renderizarTudo();
}

function removerTurma(idTurma) {
  const novasTurmas = [];
  for (let i = 0; i < turmas.length; i++) {
    if (turmas[i].id !== idTurma) novasTurmas.push(turmas[i]);
  }
  turmas = novasTurmas;

  if (turmaSelecionadaId === idTurma) {
    turmaSelecionadaId = turmas.length > 0 ? turmas[0].id : null;
    alunoSelecionadoId = null;
  }

  limparAlerta();
  renderizarTudo();
}

/* -----------------------------
   TODO (ALUNOS) — 50% do trabalho
------------------------------ */

/* TODO 1: Adicionar aluno na turma selecionada (com validações)
   Regras:
   - nome não vazio
   - numero inteiro > 0
   - numero não pode repetir na mesma turma
   - ao adicionar: turma.alunos.push(...)
   - opcional: selecionar automaticamente o novo aluno
*/
function adicionarAlunoNaTurmaSelecionada(nomeAluno, numeroAluno) {
  // TODO: implementar
  mostrarAlerta("TODO: Implementar adicionarAlunoNaTurmaSelecionada()", "warning");
}

/* TODO 2: Remover aluno
   - remover do array turma.alunos
   - se era o aluno selecionado, limpar alunoSelecionadoId
*/
function removerAluno(idAluno) {
  // TODO: implementar
  mostrarAlerta("TODO: Implementar removerAluno()", "warning");
}

/* TODO 3: Adicionar nota ao aluno selecionado (0-20)
   - validar nota (0..20)
   - adicionar a aluno.notas
   - limpar input
*/
function adicionarNotaAoAlunoSelecionado(valorNota) {
  // TODO: implementar
  mostrarAlerta("TODO: Implementar adicionarNotaAoAlunoSelecionado()", "warning");
}

/* TODO 4: Estatísticas da turma
   - total alunos
   - aprovados / reprovados / sem avaliação
   - média da turma (média das médias dos alunos com notas)
   - melhor aluno (maior média)
*/
function renderizarEstatisticasTurma() {
  const turma = obterTurmaSelecionada();

  if (!turma) {
    statTotal.textContent = "—";
    statAprovados.textContent = "—";
    statReprovados.textContent = "—";
    statSemAvaliacao.textContent = "—";
    statMediaTurma.textContent = "—";
    statMelhorAluno.textContent = "—";
    return;
  }

  // TODO: implementar estatísticas
  statTotal.textContent = String(turma.alunos.length);
  statAprovados.textContent = "TODO";
  statReprovados.textContent = "TODO";
  statSemAvaliacao.textContent = "TODO";
  statMediaTurma.textContent = "TODO";
  statMelhorAluno.textContent = "TODO";
}

/* -----------------------------
   Eventos (forms/botões) — FEITO
------------------------------ */
formAdicionarTurma.addEventListener("submit", (ev) => {
  ev.preventDefault();

  const nome = inputNomeTurma.value;
  const ano = paraInteiro(inputAnoTurma.value);

  adicionarTurma(nome, ano);

  inputNomeTurma.value = "";
  inputNomeTurma.focus();
});

formAdicionarAluno.addEventListener("submit", (ev) => {
  ev.preventDefault();

  const nomeAluno = inputNomeAluno.value;
  const numeroAluno = paraInteiro(inputNumeroAluno.value);

  adicionarAlunoNaTurmaSelecionada(nomeAluno, numeroAluno);

  // (opcional) limpar campos no sucesso — fica ao critério dos alunos
});

formAdicionarNota.addEventListener("submit", (ev) => {
  ev.preventDefault();

  const nota = paraNumero(inputNota.value);
  adicionarNotaAoAlunoSelecionado(nota);

  // (opcional) limpar no sucesso — fica ao critério dos alunos
});

botaoRecalcularStats.addEventListener("click", () => {
  renderizarEstatisticasTurma();
});

/* -----------------------------
   Controlos (ativar/desativar)
------------------------------ */
function sincronizarControlos() {
  const existeTurma = !!obterTurmaSelecionada();
  botaoAdicionarAluno.disabled = !existeTurma;
  botaoRecalcularStats.disabled = !existeTurma;

  const existeAluno = !!obterAlunoSelecionado();
  botaoAdicionarNota.disabled = !existeAluno;
}

/* -----------------------------
   Dados de exemplo (pode ser removido)
------------------------------ */
function criarDadosExemplo() {
  turmas = [
    {
      id: proximoIdTurma++,
      nome: "10A",
      ano: 10,
      alunos: [
        { id: proximoIdAluno++, nome: "Ana", numero: 3, notas: [12, 15, 14] },
        { id: proximoIdAluno++, nome: "Bruno", numero: 7, notas: [8, 9] },
      ],
    },
  ];

  turmaSelecionadaId = turmas[0].id;
  alunoSelecionadoId = turmas[0].alunos[0].id;
}

/* -----------------------------
   Inicialização
------------------------------ */
criarDadosExemplo(); // comente esta linha se não quiseres exemplos
renderizarTudo();
