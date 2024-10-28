// js/telas/cadastro.js
import { navigateTo, addUser } from '../app.js';

export function renderCadastroScreen() {
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

                <button type="submit" class="bg-blue-500 text-white py-2 px-4 rounded w-full">Cadastrar</button>
            </form>

            <p class="mt-4 text-center">
                Já tem uma conta? <a href="#" id="linkLogin" class="text-blue-500">Faça login</a>
            </p>
        </div>
    `;

    document.getElementById("cadastroForm").addEventListener("submit", async (e) => {
        e.preventDefault();

        const nome = document.getElementById("nome").value;
        const email = document.getElementById("email").value;
        const senha = document.getElementById("senha").value;
        const cargo = document.getElementById("cargo").value;

        // Cria o usuário e adiciona ao Supabase
        await addUser({ nome, email, senha, cargo });

        alert("Usuário cadastrado com sucesso!");
        navigateTo('login');
    });

    document.getElementById("linkLogin").addEventListener("click", (e) => {
        e.preventDefault();
        navigateTo('login');
    });
}
