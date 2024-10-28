// js/telas/fiscal.js
export function renderFiscalScreen() {
    const app = document.getElementById("app");
    app.innerHTML = `
        <div class="bg-white p-6 rounded-lg shadow-md max-w-sm mx-auto">
            <h2 class="text-2xl font-semibold mb-4 text-center">Painel do Fiscal</h2>
            <p class="text-center">Bem-vindo, Fiscal! Aqui você pode criar e gerenciar seus relatórios.</p>
        </div>
    `;
}
