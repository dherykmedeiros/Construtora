// js/telas/cadastro.js
import { navigateTo, addUser } from '../app.js';

export function renderCadastroScreen() {
    const app = document.getElementById("app");
    app.innerHTML = `
        <div class="bg-white p-6 rounded-lg shadow-md max-w-sm mx-auto">
            <h2 class="text-2xl font-semibold mb-4 text-center">Cadastro</h2>
            
            <form id="cadastroForm">
                <div class="mb-4">
                    <label for="username" class="block text-gray-700">Nome de Usuário:</label>
                    <input type="text" id="username" class="border p-2 w-full" placeholder="Digite o nome de usuário" required>
                </div>
                
                <div class="mb-4">
                    <label for="email" class="block text-gray-700">Email:</label>
                    <input type="email" id="email" class="border p-2 w-full" placeholder="Digite o email" required>
                </div>
                
                <div class="mb-4">
                    <label for="password" class="block text-gray-700">Senha:</label>
                    <input type="password" id="password" class="border p-2 w-full" placeholder="Digite a senha" required>
                </div>

                <div class="mb-4">
                    <label for="role" class="block text-gray-700">Tipo de Usuário:</label>
                    <select id="role" class="border p-2 w-full" required>
                        <option value="admin">Administrador</option>
                        <option value="cliente">Cliente</option>
                        <option value="fiscal">Fiscal</option>
                    </select>
                </div>

                <button type="submit" class="bg-blue-500 text-white py-2 px-4 rounded w-full">Cadastrar</button>
            </form>

            <p class="mt-4 text-center">
                Já tem uma conta? <a href="#" id="linkLogin" class="text-blue-500">Faça login</a>
            </p>
        </div>
    `;

    document.getElementById("cadastroForm").addEventListener("submit", (e) => {
        e.preventDefault();

        const username = document.getElementById("username").value;
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
        const role = document.getElementById("role").value;

        // Cria o usuário e adiciona ao localStorage
        addUser({ username, email, password, role });

        alert("Usuário cadastrado com sucesso!");
        navigateTo('login');
    });

    document.getElementById("linkLogin").addEventListener("click", (e) => {
        e.preventDefault();
        navigateTo('login');
    });
}
