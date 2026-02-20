/* =====================================================
   Gestor de Escola - Versão Completa
   ===================================================== */

let turmas = [];
let turmaSelecionadaId = null;
let alunoSelecionadoId = null;

// IDs incrementais
let proximoIdTurma = 1;
let proximoIdAluno = 1;

// Variáveis para Bónus (Pesquisa e Ordenação)
let filtroPesquisa = "";
let ordemDescendente = false;

/* -----------------------------
   Referências ao DOM
------------------------------ */
const zonaAlertas = document.querySelector("#alertHost");
const formAdicionarTurma = document.querySelector("#formAddClass");
const inputNomeTurma = document.querySelector("#className");
const inputAnoTurma = document.querySelector("#classYear");
const listaTurmas = document.querySelector("#classList");
const badgeTotalTurmas = document.querySelector("#badgeClassCount");
const labelTurmaAtiva = document.querySelector("#activeClassLabel");

const formAdicionarAluno = document.querySelector("#formAddStudent");
const inputNomeAluno = document.querySelector("#studentName");
const inputNumeroAluno = document.querySelector("#studentNumber");
const listaAlunos = document.querySelector("#studentList");
const botaoAdicionarAluno = document.querySelector("#btnAddStudent");

const formAdicionarNota = document.querySelector("#formAddGrade");
const inputNota = document.querySelector("#gradeValue");
const botaoAdicionarNota = document.querySelector("#btnAddGrade");
const listaNotas = document.querySelector("#gradeList");
const badgeTotalNotas = document.querySelector("#badgeGradeCount");

const labelAlunoAtivo = document.querySelector("#activeStudentLabel");
const elMediaAluno = document.querySelector("#studentAverage");
const elSituacaoAluno = document.querySelector("#studentStatus");

const botaoRecalcularStats = document.querySelector("#btnRecalcStats");
const statTotal = document.querySelector("#statTotal");
const statAprovados = document.querySelector("#statApproved");
const statReprovados = document.querySelector("#statFailed");
const statSemAvaliacao = document.querySelector("#statNoEval");
const statMediaTurma = document.querySelector("#statClassAvg");
const statMelhorAluno = document.querySelector("#statBest");

/* -----------------------------
   Alertas e Utilitários
------------------------------ */
function mostrarAlerta(mensagem, tipo = "danger") {
    zonaAlertas.innerHTML = `
        <div class="alert alert-${tipo} alert-dismissible fade show" role="alert">
            ${mensagem}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Fechar"></button>
        </div>`;
}

function limparAlerta() { zonaAlertas.innerHTML = ""; }

function paraInteiro(valor) {
    const n = Math.trunc(Number(valor));
    return isNaN(n) ? NaN : n;
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
   Cálculos Base
------------------------------ */
function calcularMediaAluno(aluno) {
    if (!aluno.notas || aluno.notas.length === 0) return null;
    let soma = 0;
    for (let i = 0; i < aluno.notas.length; i++) soma += aluno.notas[i];
    return soma / aluno.notas.length;
}

function calcularSituacaoAluno(aluno) {
    const media = calcularMediaAluno(aluno);
    if (media === null) return "Sem avaliação";
    return media >= 10 ? "Aprovado" : "Reprovado";
}

/* -----------------------------
   TODO 1: Adicionar Aluno
------------------------------ */
function adicionarAlunoNaTurmaSelecionada(nomeAluno, numeroAluno) {
    const turma = obterTurmaSelecionada();
    if (!turma) return;

    if (!nomeAluno || nomeAluno.trim() === "") {
        mostrarAlerta("O nome é obrigatório.");
        return;
    }
    if (isNaN(numeroAluno) || numeroAluno <= 0) {
        mostrarAlerta("O número deve ser um inteiro positivo.");
        return;
    }
    for (let i = 0; i < turma.alunos.length; i++) {
        if (turma.alunos[i].numero === numeroAluno) {
            mostrarAlerta("Este número já existe nesta turma.");
            return;
        }
    }

    const novoAluno = {
        id: proximoIdAluno++,
        nome: nomeAluno.trim(),
        numero: numeroAluno,
        notas: []
    };

    turma.alunos.push(novoAluno);
    alunoSelecionadoId = novoAluno.id;
    
    inputNomeAluno.value = "";
    inputNumeroAluno.value = "";
    guardarDados();
    renderizarTudo();
}

/* -----------------------------
   TODO 2: Remover Aluno 
------------------------------ */
function removerAluno(idAluno) {
    const turma = obterTurmaSelecionada();
    if (!turma) return;

    const novaLista = [];
    for (let i = 0; i < turma.alunos.length; i++) {
        if (turma.alunos[i].id !== idAluno) novaLista.push(turma.alunos[i]);
    }
    turma.alunos = novaLista;

    if (alunoSelecionadoId === idAluno) alunoSelecionadoId = null;

    guardarDados();
    renderizarTudo();
}

/* -----------------------------
   TODO 3: Adicionar Nota 
------------------------------ */
function adicionarNotaAoAlunoSelecionado(valorNota) {
    const aluno = obterAlunoSelecionado();
    if (!aluno) return;

    if (isNaN(valorNota) || valorNota < 0 || valorNota > 20) {
        mostrarAlerta("A nota deve estar entre 0 e 20.");
        return;
    }

    aluno.notas.push(valorNota);
    inputNota.value = "";
    guardarDados();
    renderizarTudo();
}

/* -----------------------------
   TODO 4: Estatísticas 
------------------------------ */
function renderizarEstatisticasTurma() {
    const turma = obterTurmaSelecionada();
    if (!turma) {
        statTotal.textContent = "—"; statAprovados.textContent = "—";
        statReprovados.textContent = "—"; statSemAvaliacao.textContent = "—";
        statMediaTurma.textContent = "—"; statMelhorAluno.textContent = "—";
        return;
    }

    let aprovados = 0, reprovados = 0, semEval = 0;
    let somaMedias = 0, contagemMedias = 0;
    let melhorAluno = null, maiorMedia = -1;

    for (let i = 0; i < turma.alunos.length; i++) {
        const aluno = turma.alunos[i];
        const media = calcularMediaAluno(aluno);
        const situacao = calcularSituacaoAluno(aluno);

        if (situacao === "Aprovado") aprovados++;
        else if (situacao === "Reprovado") reprovados++;
        else semEval++;

        if (media !== null) {
            somaMedias += media;
            contagemMedias++;
            if (media > maiorMedia) {
                maiorMedia = media;
                melhorAluno = aluno;
            }
        }
    }

    statTotal.textContent = turma.alunos.length;
    statAprovados.textContent = aprovados;
    statReprovados.textContent = reprovados;
    statSemAvaliacao.textContent = semEval;
    statMediaTurma.textContent = contagemMedias > 0 ? (somaMedias / contagemMedias).toFixed(2) : "0.00";
    statMelhorAluno.textContent = melhorAluno ? `${melhorAluno.nome} (${maiorMedia.toFixed(1)})` : "—";
}

/* -----------------------------
   Renderização e Persistência
------------------------------ */
function guardarDados() {
    const dados = { turmas, proximoIdTurma, proximoIdAluno };
    localStorage.setItem("gestor_escola_atec", JSON.stringify(dados));
}

function carregarDados() {
    const guardado = localStorage.getItem("gestor_escola_atec");
    if (guardado) {
        const d = JSON.parse(guardado);
        turmas = d.turmas;
        proximoIdTurma = d.proximoIdTurma;
        proximoIdAluno = d.proximoIdAluno;
    }
}

function renderizarTudo() {
    renderizarTurmas();
    renderizarAlunos();
    renderizarNotas();
    renderizarResumoAluno();
    renderizarEstatisticasTurma();
    sincronizarControlos();
}

function renderizarTurmas() {
    badgeTotalTurmas.textContent = turmas.length;
    listaTurmas.innerHTML = "";
    if (turmas.length === 0) {
        listaTurmas.innerHTML = `<div class="text-muted small">Sem turmas.</div>`;
        labelTurmaAtiva.textContent = "—";
        return;
    }

    for (let i = 0; i < turmas.length; i++) {
        const t = turmas[i];
        const ativa = t.id === turmaSelecionadaId;
        const item = document.createElement("button");
        item.className = `list-group-item list-group-item-action d-flex justify-content-between ${ativa ? 'active' : ''}`;
        item.innerHTML = `
            <div><b>${t.nome}</b><br><small>Ano ${t.ano} • ${t.alunos.length} alunos</small></div>
            <span class="btn btn-sm ${ativa ? 'btn-light' : 'btn-outline-danger'}" data-id="${t.id}" data-acao="rem-t">Remover</span>`;
        
        item.onclick = (e) => {
            if (e.target.dataset.acao === "rem-t") {
                removerTurma(paraInteiro(e.target.dataset.id));
            } else {
                turmaSelecionadaId = t.id;
                alunoSelecionadoId = null;
                renderizarTudo();
            }
        };
        listaTurmas.appendChild(item);
    }
    const sel = obterTurmaSelecionada();
    labelTurmaAtiva.textContent = sel ? `${sel.nome} (Ano ${sel.ano})` : "—";
}

function renderizarAlunos() {
    listaAlunos.innerHTML = "";
    const turma = obterTurmaSelecionada();
    if (!turma) return;

    // Criamos uma cópia para não alterar a ordem original da base de dados
    let alunosParaExibir = [...turma.alunos];

    // BÓNUS: Filtro de Pesquisa 
    if (filtroPesquisa) {
        alunosParaExibir = alunosParaExibir.filter(a => 
            a.nome.toLowerCase().includes(filtroPesquisa.toLowerCase()) || 
            String(a.numero).includes(filtroPesquisa)
        );
    }

    // BÓNUS: Ordenação por Média (Melhor para Pior) 
    if (ordemDescendente) {
        alunosParaExibir.sort((a, b) => {
            const mediaA = calcularMediaAluno(a) || 0; // Se não tiver nota, assume 0 
            const mediaB = calcularMediaAluno(b) || 0;
            return mediaB - mediaA; // Ordem descendente
        });
    }

    // Renderização dos alunos filtrados/ordenados
    for (let i = 0; i < alunosParaExibir.length; i++) {
        const a = alunosParaExibir[i];
        const ativo = a.id === alunoSelecionadoId;
        const item = document.createElement("button");
        item.className = `list-group-item list-group-item-action d-flex justify-content-between ${ativo ? 'active' : ''}`;
        
        const media = calcularMediaAluno(a);
        const mediaTexto = media !== null ? media.toFixed(1) : "—";

        item.innerHTML = `
            <div>
                <b>${a.numero} — ${a.nome}</b><br>
                <small class="${ativo ? 'text-white-50' : 'text-muted'}">Média: ${mediaTexto}</small>
            </div>
            <span class="btn btn-sm ${ativo ? 'btn-light' : 'btn-outline-danger'}" data-id="${a.id}" data-acao="rem-a">Remover</span>`;
        
        item.onclick = (e) => {
            if (e.target.dataset.acao === "rem-a") {
                removerAluno(paraInteiro(e.target.dataset.id));
            } else {
                alunoSelecionadoId = a.id;
                renderizarTudo();
            }
        };
        listaAlunos.appendChild(item);
    }
}

function renderizarNotas() {
    listaNotas.innerHTML = "";
    const a = obterAlunoSelecionado();
    badgeTotalNotas.textContent = a ? a.notas.length : "0";
    labelAlunoAtivo.textContent = a ? `${a.numero} — ${a.nome}` : "—";
    if (!a) return;
    for (let n of a.notas) {
        const span = document.createElement("span");
        span.className = "badge text-bg-success me-1";
        span.textContent = n;
        listaNotas.appendChild(span);
    }
}

function renderizarResumoAluno() {
    const a = obterAlunoSelecionado();
    elMediaAluno.textContent = a ? (calcularMediaAluno(a)?.toFixed(1) || "—") : "—";
    elSituacaoAluno.textContent = a ? calcularSituacaoAluno(a) : "—";
}

function sincronizarControlos() {
    const t = !!obterTurmaSelecionada();
    botaoAdicionarAluno.disabled = !t;
    botaoRecalcularStats.disabled = !t;
    botaoAdicionarNota.disabled = !obterAlunoSelecionado();
}

/* -----------------------------
   Eventos de Turmas
------------------------------ */
function adicionarTurma(nome, ano) {
    if (!nome || nome.trim() === "" || ano < 10 || ano > 12) {
        mostrarAlerta("Dados da turma inválidos."); return;
    }
    const nova = { id: proximoIdTurma++, nome: nome.trim(), ano, alunos: [] };
    turmas.push(nova);
    turmaSelecionadaId = nova.id;
    guardarDados();
    renderizarTudo();
}

function removerTurma(id) {
    turmas = turmas.filter(t => t.id !== id);
    if (turmaSelecionadaId === id) {
        turmaSelecionadaId = turmas.length > 0 ? turmas[0].id : null;
        alunoSelecionadoId = null;
    }
    guardarDados();
    renderizarTudo();
}

/* -----------------------------
   Inicialização
------------------------------ */
const inputPesquisa = document.querySelector("#inputSearch");
const checkOrdenar = document.querySelector("#checkOrder");

// Evento: Pesquisar enquanto escreve
inputPesquisa.addEventListener("input", (e) => {
    filtroPesquisa = e.target.value; // Atualiza a variável global de bónus 
    renderizarAlunos(); // Atualiza a lista instantaneamente com o novo filtro
});

// Evento: Alternar ordenação
checkOrdenar.addEventListener("change", (e) => {
    ordemDescendente = e.target.checked; // Ativa/Desativa o bónus de ordenação 
    renderizarAlunos();
});

formAdicionarTurma.onsubmit = (e) => {
    e.preventDefault();
    adicionarTurma(inputNomeTurma.value, paraInteiro(inputAnoTurma.value));
    inputNomeTurma.value = "";
};

formAdicionarAluno.onsubmit = (e) => {
    e.preventDefault();
    adicionarAlunoNaTurmaSelecionada(inputNomeAluno.value, paraInteiro(inputNumeroAluno.value));
};

formAdicionarNota.onsubmit = (e) => {
    e.preventDefault();
    adicionarNotaAoAlunoSelecionado(paraInteiro(inputNota.value));
};

botaoRecalcularStats.onclick = renderizarEstatisticasTurma;

carregarDados();
renderizarTudo();