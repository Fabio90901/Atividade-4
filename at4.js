 // Array para armazenar os chamados
 let chamados = [];
 let nextId = 1;
 let chamadoParaExcluir = null;

 // Elementos do DOM
 const formChamado = document.getElementById('form-chamado');
 const tipoSelect = document.getElementById('tipo');
 const melhoriaGroup = document.getElementById('melhoria-group');
 const listaChamados = document.getElementById('lista-chamados');
 const filterTipo = document.getElementById('filter-tipo');
 const filterTime = document.getElementById('filter-time');
 const filterStatus = document.getElementById('filter-status');
 
 // Elementos do modal
 const modalExcluir = document.getElementById('modal-excluir');
 const modalMensagem = document.getElementById('modal-mensagem');
 const btnCancelarExclusao = document.getElementById('btn-cancelar-exclusao');
 const btnConfirmarExclusao = document.getElementById('btn-confirmar-exclusao');

 // Elementos de estatísticas
 const totalChamadosElement = document.getElementById('total-chamados');
 const chamadosAbertosElement = document.getElementById('chamados-abertos');
 const chamadosSustentacaoElement = document.getElementById('chamados-sustentacao');
 const chamadosProjetosElement = document.getElementById('chamados-projetos');

 // Mostrar/ocultar campo de tamanho da melhoria
 tipoSelect.addEventListener('change', function() {
     if (this.value === 'MELHORIA') {
         melhoriaGroup.style.display = 'block';
         document.getElementById('tamanho-melhoria').required = true;
     } else {
         melhoriaGroup.style.display = 'none';
         document.getElementById('tamanho-melhoria').required = false;
     }
 });

 // Adicionar chamado
 formChamado.addEventListener('submit', function(e) {
     e.preventDefault();
     
     // Obter valores do formulário
     const titulo = document.getElementById('titulo').value;
     const descricao = document.getElementById('descricao').value;
     const tipo = document.getElementById('tipo').value;
     const tamanhoMelhoria = tipo === 'MELHORIA' ? document.getElementById('tamanho-melhoria').value : null;
     const solicitante = document.getElementById('solicitante').value;
     
     // Validar campos
     if (!titulo || !descricao || !tipo || !solicitante) {
         alert('Por favor, preencha todos os campos obrigatórios (*)');
         return;
     }
     
     if (tipo === 'MELHORIA' && !tamanhoMelhoria) {
         alert('Por favor, selecione o tamanho da melhoria');
         return;
     }
     
     // Determinar o time baseado nas regras de negócio
     let timeDestino = '';
     let tipoExibicao = tipo;
     
     if (tipo === 'BUG') {
         timeDestino = 'SUSTENTACAO';
     } else if (tipo === 'MELHORIA') {
         if (tamanhoMelhoria === 'GRANDE') {
             timeDestino = 'PROJETOS';
             tipoExibicao = 'GRANDE_MELHORIA';
         } else {
             timeDestino = 'SUSTENTACAO';
         }
     }
     
     // Criar objeto do chamado
     const novoChamado = {
         id: nextId++,
         titulo: titulo,
         descricao: descricao,
         tipo: tipoExibicao,
         time: timeDestino,
         solicitante: solicitante,
         data: new Date().toLocaleString('pt-BR'),
         status: 'ABERTO'
     };
     
     // Adicionar ao array
     chamados.push(novoChamado);
     
     // Atualizar a exibição
     atualizarListaChamados();
     atualizarEstatisticas();
     
     // Limpar formulário
     formChamado.reset();
     melhoriaGroup.style.display = 'none';
     
     // Mostrar mensagem de sucesso
     alert(`Chamado #${novoChamado.id} registrado com sucesso! Direcionado para o time de ${timeDestino === 'SUSTENTACAO' ? 'Sustentação' : 'Projetos'}.`);
 });

 // Função para fechar um chamado
 function fecharChamado(id) {
     const chamadoIndex = chamados.findIndex(chamado => chamado.id === id);
     
     if (chamadoIndex !== -1) {
         if (chamados[chamadoIndex].status === 'FECHADO') {
             alert('Este chamado já está fechado!');
             return;
         }
         
         if (confirm(`Deseja realmente fechar o chamado #${id}?`)) {
             chamados[chamadoIndex].status = 'FECHADO';
             atualizarListaChamados();
             atualizarEstatisticas();
             alert(`Chamado #${id} fechado com sucesso!`);
         }
     }
 }

 // Função para abrir o modal de exclusão
 function abrirModalExclusao(id) {
     const chamado = chamados.find(ch => ch.id === id);
     if (!chamado) return;
     
     chamadoParaExcluir = id;
     modalMensagem.textContent = `Tem certeza que deseja excluir o chamado #${id} - "${chamado.titulo}"? Esta ação não pode ser desfeita.`;
     modalExcluir.style.display = 'flex';
 }

 // Função para excluir um chamado
 function excluirChamado(id) {
     const chamadoIndex = chamados.findIndex(chamado => chamado.id === id);
     
     if (chamadoIndex !== -1) {
         chamados.splice(chamadoIndex, 1);
         atualizarListaChamados();
         atualizarEstatisticas();
         alert(`Chamado #${id} excluído com sucesso!`);
     }
     
     chamadoParaExcluir = null;
     modalExcluir.style.display = 'none';
 }

 // Função para atualizar a lista de chamados
 function atualizarListaChamados() {
     // Obter filtros
     const tipoFiltro = filterTipo.value;
     const timeFiltro = filterTime.value;
     const statusFiltro = filterStatus.value;
     
     // Filtrar chamados
     let chamadosFiltrados = chamados.filter(chamado => {
         // Filtro por tipo
         if (tipoFiltro !== 'TODOS' && chamado.tipo !== tipoFiltro) {
             return false;
         }
         
         // Filtro por time
         if (timeFiltro !== 'TODOS' && chamado.time !== timeFiltro) {
             return false;
         }
         
         // Filtro por status
         if (statusFiltro !== 'TODOS' && chamado.status !== statusFiltro) {
             return false;
         }
         
         return true;
     });
     
     // Ordenar por ID (mais recentes primeiro)
     chamadosFiltrados.sort((a, b) => b.id - a.id);
     
     // Limpar lista
     listaChamados.innerHTML = '';
     
     // Adicionar chamados filtrados
     if (chamadosFiltrados.length === 0) {
         listaChamados.innerHTML = '<div class="no-chamados"><p>Nenhum chamado encontrado com os filtros selecionados.</p><p>Clique em "Registrar Chamado" para adicionar um novo.</p></div>';
         return;
     }
     
     chamadosFiltrados.forEach(chamado => {
         const chamadoElement = document.createElement('div');
         chamadoElement.className = `chamado-card ${chamado.tipo === 'BUG' ? 'chamado-bug' : chamado.tipo === 'GRANDE_MELHORIA' ? 'chamado-grande-melhoria' : 'chamado-melhoria'}`;
         
         // Determinar classe do tipo
         let tipoClasse = '';
         let tipoTexto = '';
         
         if (chamado.tipo === 'BUG') {
             tipoClasse = 'tipo-bug';
             tipoTexto = 'BUG';
         } else if (chamado.tipo === 'GRANDE_MELHORIA') {
             tipoClasse = 'tipo-grande-melhoria';
             tipoTexto = 'GRANDE MELHORIA';
         } else {
             tipoClasse = 'tipo-melhoria';
             tipoTexto = 'MELHORIA';
         }
         
         // Determinar texto do time
         let timeTexto = chamado.time === 'SUSTENTACAO' ? 'Time de Sustentação' : 'Time de Projetos';
         let timeClasse = chamado.time === 'SUSTENTACAO' ? 'time-sustentacao' : 'time-projetos';
         
         chamadoElement.innerHTML = `
             <div class="chamado-header">
                 <div>
                     <h3>${chamado.titulo}</h3>
                     <div class="chamado-id">#${chamado.id}</div>
                 </div>
                 <div class="chamado-tipo ${tipoClasse}">${tipoTexto}</div>
             </div>
             
             <div class="chamado-descricao">
                 ${chamado.descricao}
             </div>
             
             <div class="${timeClasse} chamado-time">${timeTexto}</div>
             
             <div class="chamado-footer">
                 <div>
                     <span>Solicitante: ${chamado.solicitante}</span>
                     <br>
                     <span>Data: ${chamado.data}</span>
                 </div>
                 <div class="status-${chamado.status.toLowerCase()}">${chamado.status === 'ABERTO' ? 'ABERTO' : 'FECHADO'}</div>
             </div>
             
             <div class="acoes-chamado">
                 ${chamado.status === 'ABERTO' ? `
                 <button class="btn btn-success btn-acao" onclick="fecharChamado(${chamado.id})">Fechar Chamado</button>
                 ` : ''}
                 <button class="btn btn-danger btn-acao" onclick="abrirModalExclusao(${chamado.id})">Excluir Chamado</button>
             </div>
         `;
         
         listaChamados.appendChild(chamadoElement);
     });
 }

 // Função para atualizar as estatísticas
 function atualizarEstatisticas() {
     // Total de chamados
     totalChamadosElement.textContent = chamados.length;
     
     // Chamados abertos
     const abertos = chamados.filter(ch => ch.status === 'ABERTO').length;
     chamadosAbertosElement.textContent = abertos;
     
     // Chamados para sustentação
     const paraSustentacao = chamados.filter(ch => ch.time === 'SUSTENTACAO').length;
     chamadosSustentacaoElement.textContent = paraSustentacao;
     
     // Chamados para projetos
     const paraProjetos = chamados.filter(ch => ch.time === 'PROJETOS').length;
     chamadosProjetosElement.textContent = paraProjetos;
 }

 // Adicionar eventos para os filtros
 filterTipo.addEventListener('change', atualizarListaChamados);
 filterTime.addEventListener('change', atualizarListaChamados);
 filterStatus.addEventListener('change', atualizarListaChamados);

 // Configurar eventos do modal
 btnCancelarExclusao.addEventListener('click', function() {
     chamadoParaExcluir = null;
     modalExcluir.style.display = 'none';
 });

 btnConfirmarExclusao.addEventListener('click', function() {
     if (chamadoParaExcluir) {
         excluirChamado(chamadoParaExcluir);
     }
 });

 // Fechar modal ao clicar fora dele
 window.addEventListener('click', function(event) {
     if (event.target === modalExcluir) {
         chamadoParaExcluir = null;
         modalExcluir.style.display = 'none';
     }
 });

 // Inicializar a lista vazia
 atualizarListaChamados();
 atualizarEstatisticas();