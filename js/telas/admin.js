// js/telas/admin.js
import { navigateTo } from '../app.js';
import { _supabase} from '../supabase.js';

export async function renderAdminScreen() {
    const app = document.getElementById("app");
    app.innerHTML = `
        <div class="bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto">
            <h2 class="text-2xl font-semibold mb-4 text-center">Painel do Administrador</h2>
            <p class="text-center mb-6">Bem-vindo, Administrador! Aqui você pode gerenciar o sistema.</p>

            <!-- Botão para redirecionar para a tela de cadastro -->
            <div class="flex justify-end mb-4">
                <button id="btnCadastro" class="bg-blue-500 text-white px-4 py-2 rounded">Novo Cadastro</button>
            </div>

            <div id="userList" class="mt-4"></div>
        </div>
    `;

    document.getElementById("btnCadastro").addEventListener("click", () => {
        // Redireciona para a tela de cadastro
        navigateTo('cadastro');
    });

    const userList = document.getElementById("userList");

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

    // Carregar usuários ao renderizar a tela
    loadUsers();
}
