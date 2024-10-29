// js/telas/admin.js
import { _supabase } from '../supabase.js';
import { logoutUser, navigateTo } from '../app.js';

export async function renderAdminScreen() {
    const app = document.getElementById("app");
    app.innerHTML = `
        <div class="bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto">
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-2xl font-semibold">Painel do Administrador</h2>
                <button id="logoutButton" class="bg-red-500 text-white px-4 py-2 rounded">Logout</button>
            </div>
            <p class="text-center mb-6">Bem-vindo, Administrador! Aqui você pode gerenciar o sistema.</p>

            <div id="userList" class="mt-4"></div>
            <div id="relatorioList" class="mt-4"></div>
            <button id="goToCadastroButton" class="bg-blue-500 text-white py-2 px-4 rounded mt-6">
                Cadastrar Novo Usuário
            </button>
        </div>

        <!-- Modal para visualizar a imagem em um carrossel -->
        <div id="modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center hidden">
            <span class="absolute top-4 right-4 text-white text-2xl cursor-pointer" onclick="fecharModal()">&times;</span>
            <img id="modalImg" class="max-w-full max-h-full rounded-lg" />
            <button id="prevImg" class="absolute left-4 text-white text-2xl cursor-pointer" onclick="navegarImagem(-1)">&#10094;</button>
            <button id="nextImg" class="absolute right-4 text-white text-2xl cursor-pointer" onclick="navegarImagem(1)">&#10095;</button>
        </div>
    `;

    document.getElementById("logoutButton").addEventListener("click", logoutUser);
    document.getElementById("goToCadastroButton").addEventListener("click", () => {
        navigateTo("cadastro");
    });

    const userList = document.getElementById("userList");
    const relatorioList = document.getElementById("relatorioList");
    let imagensAtuais = [];
    let indiceImagemAtual = 0;

    // Função para carregar usuários
    async function loadUsers() {
        const { data: users, error } = await _supabase.from('usuarios').select('*');

        if (error) {
            console.error('Erro ao carregar usuários:', error.message);
            userList.innerHTML = "<p class='text-red-500'>Erro ao carregar usuários</p>";
            return;
        }

        userList.innerHTML = `
            <table class="table-auto w-full bg-gray-100 rounded-lg">
                <thead>
                    <tr class="bg-gray-300 text-left">
                        <th class="px-4 py-2">Nome</th>
                        <th class="px-4 py-2">Email</th>
                        <th class="px-4 py-2">Cargo</th>
                        <th class="px-4 py-2">Ações</th>
                    </tr>
                </thead>
                <tbody>
                    ${users
                        .map(
                            user => `
                                <tr>
                                    <td class="border px-4 py-2">${user.nome}</td>
                                    <td class="border px-4 py-2">${user.email}</td>
                                    <td class="border px-4 py-2">${user.cargo}</td>
                                    <td class="border px-4 py-2">
                                        <button class="bg-red-500 text-white px-2 py-1 rounded" onclick="deleteUser('${user.id}')">Deletar</button>
                                        <button class="bg-blue-500 text-white px-2 py-1 rounded ml-2">Editar</button>
                                    </td>
                                </tr>
                            `
                        )
                        .join('')}
                </tbody>
            </table>
        `;
    }

    // Função para deletar usuário
    window.deleteUser = async function(userId) {
        const { error } = await _supabase.from('usuarios').delete().eq('id', userId);

        if (error) {
            console.error('Erro ao deletar usuário:', error.message);
            alert("Erro ao deletar usuário.");
        } else {
            alert("Usuário deletado com sucesso.");
            loadUsers();
        }
    };

    // Função para carregar relatórios pendentes
    async function loadRelatoriosPendentes() {
        const { data: relatorios, error } = await _supabase
            .from('relatorios')
            .select('*')
            .eq('status', 'Pendente');

        if (error) {
            console.error('Erro ao carregar relatórios pendentes:', error.message);
            relatorioList.innerHTML = "<p class='text-red-500'>Erro ao carregar relatórios pendentes</p>";
            return;
        }

        relatorioList.innerHTML = `
            <h3 class="text-xl font-semibold">Relatórios Pendentes</h3>
            <table class="table-auto w-full bg-gray-100 rounded-lg mt-4">
                <thead>
                    <tr class="bg-gray-300 text-left">
                        <th class="px-4 py-2">Nome do Relatório</th>
                        <th class="px-4 py-2">Atualizações</th>
                        <th class="px-4 py-2">Localização</th>
                        <th class="px-4 py-2">Data de Criação</th>
                        <th class="px-4 py-2">Imagem</th>
                        <th class="px-4 py-2">Ações</th>
                    </tr>
                </thead>
                <tbody>
                    ${relatorios.map(relatorio => `
                        <tr>
                            <td class="border px-4 py-2">${relatorio.nome}</td>
                            <td class="border px-4 py-2">${relatorio.atualizacoes}</td>
                            <td class="border px-4 py-2">${relatorio.localizacao || 'Não informado'}</td>
                            <td class="border px-4 py-2">${new Date(relatorio.created_at).toLocaleString()}</td>
                            <td class="border px-4 py-2">
                                <img src="${relatorio.imagens[0]}" alt="Imagem do relatório" class="w-12 h-12 rounded cursor-pointer" onclick="abrirImagemModal(${JSON.stringify(relatorio.imagens)})" />
                            </td>
                            <td class="border px-4 py-2">
                                <button class="bg-green-500 text-white px-2 py-1 rounded" onclick="updateRelatorioStatus('${relatorio.id}', 'Aprovado')">Aprovar</button>
                                <button class="bg-red-500 text-white px-2 py-1 rounded ml-2" onclick="updateRelatorioStatus('${relatorio.id}', 'Reprovado')">Reprovar</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }

    // Função para atualizar o status do relatório
    window.updateRelatorioStatus = async function(relatorioId, novoStatus) {
        const { error } = await _supabase
            .from('relatorios')
            .update({ status: novoStatus })
            .eq('id', relatorioId);

        if (error) {
            console.error('Erro ao atualizar status do relatório:', error.message);
            alert("Erro ao atualizar status do relatório.");
        } else {
            alert(`Relatório ${novoStatus === 'Aprovado' ? 'aprovado' : 'reprovado'} com sucesso.`);
            loadRelatoriosPendentes(); // Atualiza a lista após a ação
        }
    };

    // Função para abrir imagem em um carrossel no modal
    window.abrirImagemModal = function(imagens) {
        imagensAtuais = imagens;
        indiceImagemAtual = 0;
        exibirImagemModal();
    }

    // Função para exibir a imagem atual no modal
    function exibirImagemModal() {
        const modal = document.getElementById('modal');
        const modalImg = document.getElementById('modalImg');
        modal.style.display = 'flex';
        modalImg.src = imagensAtuais[indiceImagemAtual];
    }

    // Função para navegar entre as imagens no modal
    window.navegarImagem = function(direcao) {
        indiceImagemAtual = (indiceImagemAtual + direcao + imagensAtuais.length) % imagensAtuais.length;
        exibirImagemModal();
    }

    // Função para fechar o modal
    window.fecharModal = function() {
        const modal = document.getElementById('modal');
        modal.style.display = 'none';
    }

    loadUsers();
    loadRelatoriosPendentes();
}
