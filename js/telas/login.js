// js/telas/login.js
import { navigateTo, loginUser } from '../app.js';

export function renderLoginScreen() {
    const app = document.getElementById("app");
    app.innerHTML = `
        <div class="bg-white p-6 rounded-lg shadow-md max-w-sm mx-auto">
            <h2 class="text-2xl font-semibold mb-4 text-center">Login</h2>
            
            <form id="loginForm">
                <div class="mb-4">
                    <label for="email" class="block text-gray-700">Email:</label>
                    <input type="email" id="email" class="border p-2 w-full" placeholder="Digite seu email" required>
                </div>
                
                <div class="mb-4">
                    <label for="password" class="block text-gray-700">Senha:</label>
                    <input type="password" id="password" class="border p-2 w-full" placeholder="Digite sua senha" required>
                </div>

                <button type="submit" class="bg-blue-500 text-white py-2 px-4 rounded w-full">Entrar</button>
            </form>

            <p class="mt-4 text-center">
                Não tem uma conta? <a href="#" id="linkCadastro" class="text-blue-500">Cadastre-se</a>
            </p>
        </div>
    `;

    document.getElementById("loginForm").addEventListener("submit", async (e) => {
        e.preventDefault();

        const email = document.getElementById("email").value;
        const senha = document.getElementById("password").value;

        // Valida o login
        await loginUser(email, senha);
    });

    document.getElementById("linkCadastro").addEventListener("click", (e) => {
        e.preventDefault();
        navigateTo('cadastro');
    });
}
