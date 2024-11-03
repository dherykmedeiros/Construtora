// js/telas/cliente.js
import { _supabase } from '../supabase.js';
import { logoutUser, getAuthenticatedUser } from '../app.js';

export async function renderClientScreen() {
    const app = document.getElementById("app");
    app.innerHTML = `
        <div class="bg-white p-6 rounded-lg shadow-md max-w-5xl mx-auto">
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-2xl font-semibold">Painel do Cliente</h2>
                <button id="logoutButton" class="bg-red-500 text-white px-4 py-2 rounded">Logout</button>
            </div>
            <p class="text-center">Bem-vindo, Cliente! Aqui você pode visualizar seus relatórios e histórico.</p>
            <div id="relatorioList" class="mt-4"></div>
        </div>
        <div id="imageCarouselModal" class="hidden fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center">
            <button id="closeCarousel" class="absolute top-4 right-4 text-white text-2xl cursor-pointer">&times;</button>
            <button id="prevImage" class="absolute left-4 text-white text-3xl cursor-pointer">&larr;</button>
            <img id="carouselImage" class="max-w-full max-h-full" src="" alt="Imagem do Relatório" />
            <button id="nextImage" class="absolute right-4 text-white text-3xl cursor-pointer">&rarr;</button>
        </div>
    `;

    document.getElementById("logoutButton").addEventListener("click", logoutUser);

    const relatorioList = document.getElementById("relatorioList");
    const carouselModal = document.getElementById("imageCarouselModal");
    const carouselImage = document.getElementById("carouselImage");
    const closeCarousel = document.getElementById("closeCarousel");
    const prevImage = document.getElementById("prevImage");
    const nextImage = document.getElementById("nextImage");

    let currentImageIndex = 0;
    let currentImages = [];

    // Função para carregar relatórios aprovados vinculados à obra do cliente
    async function loadRelatoriosAprovados() {
        const authenticatedUser = getAuthenticatedUser();
        const obraId = authenticatedUser?.obra_id;

        if (!obraId) {
            relatorioList.innerHTML = "<p class='text-red-500'>Erro: Obra não atribuída ao cliente.</p>";
            return;
        }

        // Obter todos os relatórios aprovados e verificar se já foram assinados pelo usuário
        const { data: relatorios, error } = await _supabase
            .from('relatorios')
            .select(`
                *,
                assinaturas!inner(usuario_id)
            `)
            .eq('status', 'Aprovado')
            .eq('obra_id', obraId)
            .eq('assinaturas.usuario_id', authenticatedUser.id);

        if (error) {
            console.error('Erro ao carregar relatórios aprovados:', error.message);
            relatorioList.innerHTML = "<p class='text-red-500'>Erro ao carregar relatórios aprovados</p>";
            return;
        }

        relatorioList.innerHTML = `
            <h3 class="text-xl font-semibold">Relatórios Aprovados</h3>
            <table class="table-auto w-full bg-gray-100 rounded-lg mt-4 shadow">
                <thead>
                    <tr class="bg-gray-300 text-left">
                        <th class="px-4 py-2">Nome do Relatório</th>
                        <th class="px-4 py-2">Data</th>
                        <th class="px-4 py-2">Localização</th>
                        <th class="px-4 py-2">Atualizações</th>
                        <th class="px-4 py-2">Assinado</th>
                        <th class="px-4 py-2">Imagem</th>
                        <th class="px-4 py-2">Ações</th>
                    </tr>
                </thead>
                <tbody>
                    ${relatorios.length > 0 
                        ? relatorios.map(
                            relatorio => `
                                <tr class="border-b hover:bg-gray-200">
                                    <td class="border px-4 py-2">${relatorio.nome}</td>
                                    <td class="border px-4 py-2">${new Date(relatorio.created_at).toLocaleDateString()}</td>
                                    <td class="border px-4 py-2">${relatorio.localizacao}</td>
                                    <td class="border px-4 py-2">${relatorio.atualizacoes}</td>
                                    <td class="border px-4 py-2">${relatorio.assinaturas.length > 0 ? '✔️' : '❌'}</td>
                                    <td class="border px-4 py-2">
                                        <img src="${relatorio.imagens[0]}" alt="Imagem do Relatório" class="h-24 w-24 object-cover m-1 rounded cursor-pointer" data-images='${JSON.stringify(relatorio.imagens)}' />
                                    </td>
                                    <td class="border px-4 py-2 text-center">
                                        <button class="bg-green-500 text-white px-2 py-1 rounded shadow ${relatorio.assinaturas.length > 0 ? 'opacity-50 cursor-not-allowed' : ''}" 
                                            onclick="${relatorio.assinaturas.length > 0 ? 'event.preventDefault()' : `signAsSeen('${relatorio.id}')`}">
                                            <span class="flex items-center justify-center">
                                                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                                                </svg>
                                                Assinar como Visto
                                            </span>
                                        </button>
                                    </td>
                                </tr>
                            `
                        ).join('')
                        : '<tr><td class="border px-4 py-2 text-center" colspan="7">Nenhum relatório aprovado encontrado.</td></tr>'
                    }
                </tbody>
            </table>
        `;

        document.querySelectorAll('[data-images]').forEach(img => {
            img.addEventListener('click', () => openCarousel(JSON.parse(img.getAttribute('data-images'))));
        });
    }

    function openCarousel(images) {
        currentImages = images;
        currentImageIndex = 0;
        carouselImage.src = currentImages[currentImageIndex];
        carouselModal.classList.remove("hidden");
    }

    function showNextImage() {
        currentImageIndex = (currentImageIndex + 1) % currentImages.length;
        carouselImage.src = currentImages[currentImageIndex];
    }

    function showPrevImage() {
        currentImageIndex = (currentImageIndex - 1 + currentImages.length) % currentImages.length;
        carouselImage.src = currentImages[currentImageIndex];
    }

    nextImage.addEventListener("click", showNextImage);
    prevImage.addEventListener("click", showPrevImage);
    closeCarousel.addEventListener("click", () => {
        carouselModal.classList.add("hidden");
    });

    // Função para registrar a assinatura do relatório na tabela assinaturas
    window.signAsSeen = async function(relatorioId) {
        const authenticatedUser = getAuthenticatedUser();
        if (!authenticatedUser) {
            alert("Usuário não autenticado.");
            return;
        }

        const { error } = await _supabase
            .from('assinaturas')
            .insert([
                {
                    relatorio_id: relatorioId,
                    usuario_id: authenticatedUser.id,
                    data_assinatura: new Date().toISOString()
                }
            ]);

        if (error) {
            console.error('Erro ao registrar assinatura:', error.message);
            alert("Erro ao registrar assinatura.");
        } else {
            alert("Relatório assinado com sucesso.");
            loadRelatoriosAprovados(); // Recarrega a lista de relatórios para atualizar o status
        }
    };

    loadRelatoriosAprovados();
}
