// js/telas/cadastro.js
import { navigateTo, addUser, getAuthenticatedUser, fetchObras } from '../app.js';

export async function renderCadastroScreen() {
    const user = getAuthenticatedUser();

    // Verifica se o usuário é um administrador
    if (!user || user.cargo !== 'Administrador') {
        alert("Acesso negado! Apenas administradores podem cadastrar usuários.");
        navigateTo(user ? user.cargo.toLowerCase() : 'login');
        return;
    }

    // Busca as obras no banco de dados
    const obras = await fetchObras();

    const app = document.getElementById("app");
    app.innerHTML = `
        <div class="bg-white p-6 rounded-lg shadow-md max-w-sm mx-auto">
            <h2 class="text-2xl font-semibold mb-4 text-center">Cadastro</h2>
            <form id="cadastroForm">
                <div class="mb-4">
                    <label for="nome" class="block text-gray-700">Nome Completo:</label>
                    <input type="text" id="nome" class="border p-2 w-full" placeholder="Digite seu nome completo" required>
                </div>
                
                <div class="mb-4">
                    <label for="email" class="block text-gray-700">Email:</label>
                    <input type="email" id="email" class="border p-2 w-full" placeholder="Digite seu email" required>
                </div>
                
                <div class="mb-4">
                    <label for="senha" class="block text-gray-700">Senha:</label>
                    <input type="password" id="senha" class="border p-2 w-full" placeholder="Digite sua senha" required>
                </div>

                <div class="mb-4">
                    <label for="cargo" class="block text-gray-700">Tipo de Usuário:</label>
                    <select id="cargo" class="border p-2 w-full" required>
                        <option value="Administrador">Administrador</option>
                        <option value="Cliente">Cliente</option>
                        <option value="Fiscal">Fiscal</option>
                    </select>
                </div>

                <!-- Campo de seleção da obra, inicialmente escondido -->
                <div id="obraField" class="mb-4 hidden">
                    <label for="obra" class="block text-gray-700">Selecione a Obra:</label>
                    <select id="obra" class="border p-2 w-full">
                        <option value="">Selecione uma obra</option>
                        ${obras.map(obra => `<option value="${obra.id}">${obra.nome_da_obra} - ${obra.endereco}</option>`).join('')}
                    </select>
                </div>

                <button type="submit" class="bg-blue-500 text-white py-2 px-4 rounded w-full">Cadastrar</button>
            </form>

            <p class="mt-4 text-center">
                Já tem uma conta? <a href="#" id="linkLogin" class="text-blue-500">Faça login</a>
            </p>
        </div>
    `;

    // Mostra o campo de obra quando o tipo de usuário é "Cliente"
    const cargoSelect = document.getElementById("cargo");
    const obraField = document.getElementById("obraField");
    cargoSelect.addEventListener("change", () => {
        obraField.classList.toggle("hidden", cargoSelect.value !== "Cliente");
    });

    document.getElementById("cadastroForm").addEventListener("submit", async (e) => {
        e.preventDefault();

        const nome = document.getElementById("nome").value;
        const email = document.getElementById("email").value;
        const senha = document.getElementById("senha").value;
        const cargo = cargoSelect.value;
        const obraId = cargo === "Cliente" ? document.getElementById("obra").value : null;

        // Cria o usuário e adiciona ao Supabase
        await addUser({ nome, email, senha, cargo, obra_id: obraId });

        alert("Usuário cadastrado com sucesso!");
        navigateTo('login');
    });

    document.getElementById("linkLogin").addEventListener("click", (e) => {
        e.preventDefault();
        navigateTo('login');
    });
}
