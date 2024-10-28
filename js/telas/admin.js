// js/telas/admin.js
export function renderAdminScreen() {
    const app = document.getElementById("app");
    app.innerHTML = `
        <div class="bg-white p-6 rounded-lg shadow-md max-w-sm mx-auto">
            <h2 class="text-2xl font-semibold mb-4 text-center">Painel do Administrador</h2>
            <p class="text-center">Bem-vindo, Administrador! Aqui você pode gerenciar o sistema.</p>
        </div>
    `;
}
