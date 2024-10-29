// js/telas/fiscal.js
import { logoutUser } from '../app.js';

export function renderFiscalScreen() {
    const app = document.getElementById("app");
    app.innerHTML = `
        <div class="bg-white p-6 rounded-lg shadow-md max-w-sm mx-auto">
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-2xl font-semibold">Painel do Fiscal</h2>
                <button id="logoutButton" class="bg-red-500 text-white px-4 py-2 rounded">Logout</button>
            </div>
            <p class="text-center">Bem-vindo, Fiscal! Aqui você pode criar e gerenciar seus relatórios.</p>
        </div>
    `;

    document.getElementById("logoutButton").addEventListener("click", logoutUser);
}
