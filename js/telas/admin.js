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
            <button id="goToCadastroObraButton" class="bg-green-500 text-white py-2 px-4 rounded mt-6">
                Cadastrar Nova Obra
            </button>
        </div>

        <!-- Modal para cadastrar nova obra -->
        <div id="obraModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center hidden">
            <div class="bg-white p-6 rounded-lg shadow-md max-w-lg w-full">
                <h3 class="text-2xl font-semibold mb-4">Cadastrar Nova Obra</h3>
                <form id="obraForm">
                    <div class="mb-4">
                        <label for="nomeDaObra" class="block text-gray-700">Nome da Obra:</label>
                        <input type="text" id="nomeDaObra" class="border border-gray-300 p-2 rounded w-full" required>
                    </div>
                    <div class="mb-4">
                        <label for="enderecoObra" class="block text-gray-700">Endereço:</label>
                        <input type="text" id="enderecoObra" class="border border-gray-300 p-2 rounded w-full" required>
                    </div>
                    <div class="flex justify-end">
                        <button type="button" id="cancelObraButton" class="bg-gray-500 text-white px-4 py-2 rounded mr-2">Cancelar</button>
                        <button type="submit" class="bg-blue-500 text-white px-4 py-2 rounded">Cadastrar</button>
                    </div>
                </form>
            </div>
        </div>

        <!-- Modal para visualizar a imagem em um carrossel -->
        <div id="modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center hidden">
            <span class="absolute top-4 right-4 text-white text-2xl cursor-pointer" id="closeModal">&times;</span>
            <img id="modalImg" class="max-w-full max-h-full rounded-lg" />
            <button id="prevImg" class="absolute left-4 text-white text-2xl cursor-pointer">&#10094;</button>
            <button id="nextImg" class="absolute right-4 text-white text-2xl cursor-pointer">&#10095;</button>
        </div>
    `;

    document.getElementById("logoutButton").addEventListener("click", logoutUser);
    document.getElementById("goToCadastroButton").addEventListener("click", () => {
        navigateTo("cadastro");
    });

    // Event listener to open the obra registration modal
    document.getElementById("goToCadastroObraButton").addEventListener("click", () => {
        document.getElementById("obraModal").classList.remove("hidden");
    });

    const obraForm = document.getElementById("obraForm");
    const obraModal = document.getElementById("obraModal");
    const cancelObraButton = document.getElementById("cancelObraButton");

    // Function to handle obra registration
    obraForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const nomeDaObra = document.getElementById("nomeDaObra").value;
        const enderecoObra = document.getElementById("enderecoObra").value;

        const { error } = await _supabase.from('obras').insert([{ nome_da_obra: nomeDaObra, endereco: enderecoObra }]);

        if (error) {
            console.error('Erro ao cadastrar obra:', error.message);
            alert("Erro ao cadastrar obra.");
        } else {
            alert("Obra cadastrada com sucesso.");
            obraModal.classList.add("hidden");
            obraForm.reset();
            loadObras();
        }
    });

    cancelObraButton.addEventListener("click", () => {
        obraModal.classList.add("hidden");
    });

    const userList = document.getElementById("userList");
    const relatorioList = document.getElementById("relatorioList");
    const modal = document.getElementById('modal');
    const modalImg = document.getElementById('modalImg');
    const closeModalBtn = document.getElementById('closeModal');
    const prevImgBtn = document.getElementById('prevImg');
    const nextImgBtn = document.getElementById('nextImg');

    let imagensAtuais = [];
    let indiceImagemAtual = 0;

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

    async function loadRelatoriosPendentes() {
        const { data: relatorios, error } = await _supabase.from('relatorios').select('*').eq('status', 'Pendente');

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
                                <img src="${relatorio.imagens[0]}" alt="Imagem do relatório" class="w-12 h-12 rounded cursor-pointer" data-imagens='${JSON.stringify(relatorio.imagens)}' />
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

        document.querySelectorAll('[data-imagens]').forEach(imgElement => {
            imgElement.addEventListener('click', () => {
                const imagens = JSON.parse(imgElement.getAttribute('data-imagens'));
                abrirImagemModal(imagens);
            });
        });
    }

    function abrirImagemModal(imagens) {
        imagensAtuais = imagens;
        indiceImagemAtual = 0;
        atualizarImagemModal();
        modal.classList.remove('hidden');
    }
    
    function atualizarImagemModal() {
        modalImg.src = imagensAtuais[indiceImagemAtual];
    }
    
    // Fecha o modal ao clicar no botão de fechar
    closeModalBtn.addEventListener('click', () => {
        modal.classList.add('hidden');
    });
    
    // Botão para imagem anterior
    prevImgBtn.addEventListener('click', () => {
        indiceImagemAtual = (indiceImagemAtual - 1 + imagensAtuais.length) % imagensAtuais.length;
        atualizarImagemModal();
    });
    
    // Botão para próxima imagem
    nextImgBtn.addEventListener('click', () => {
        indiceImagemAtual = (indiceImagemAtual + 1) % imagensAtuais.length;
        atualizarImagemModal();
    });

    loadUsers();
    loadRelatoriosPendentes();
}

export async function loadObras() {
    // This function would fetch and render a list of obras if needed in the future.
}
