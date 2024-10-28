// js/telas/cliente.js
export function renderClientScreen() {
    const app = document.getElementById("app");
    app.innerHTML = `
        <div class="bg-white p-6 rounded-lg shadow-md max-w-sm mx-auto">
            <h2 class="text-2xl font-semibold mb-4 text-center">Painel do Cliente</h2>
            <p class="text-center">Bem-vindo, Cliente! Aqui você pode visualizar seus relatórios e histórico.</p>
        </div>
    `;
}
