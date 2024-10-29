import { logoutUser, getAuthenticatedUser } from '../app.js';
import { _supabase } from '../supabase.js';

// Função para fazer upload de imagens para o bucket 'imagensRelatorio'
async function uploadImagens(arquivos) {
    const urlsImagens = [];

    for (const arquivo of arquivos) {
        const nomeArquivo = `${Date.now()}-${arquivo.name}`;
        const { data, error } = await _supabase
            .storage
            .from('imagensRelatorio')
            .upload(nomeArquivo, arquivo);

        if (error) {
            console.error(`Erro ao fazer upload da imagem ${arquivo.name}:`, error.message);
            alert(`Erro ao fazer upload da imagem ${arquivo.name}`);
            return [];
        }

        const { data: publicUrlData } = _supabase
            .storage
            .from('imagensRelatorio')
            .getPublicUrl(nomeArquivo);

        urlsImagens.push(publicUrlData.publicUrl);
    }

    return urlsImagens;
}

// Função para enviar o relatório
async function enviarRelatorio() {
    const nome = document.getElementById('nomeRelatorio').value;
    const atualizacoes = document.getElementById('atualizacoes').value;
    const localizacao = document.getElementById('localizacao').value;
    const arquivos = document.getElementById('imagens').files;

    const usuario = getAuthenticatedUser();
    if (!usuario) {
        alert('Usuário não autenticado.');
        return;
    }

    const urlsImagens = await uploadImagens(arquivos);
    if (urlsImagens.length === 0) {
        alert('Falha ao fazer upload das imagens.');
        return;
    }

    const { error } = await _supabase.from('relatorios').insert([{
        usuario_id: usuario.id,
        nome,
        atualizacoes,
        imagens: urlsImagens,
        localizacao,
        created_at: new Date()
    }]);

    if (error) {
        console.error('Erro ao enviar relatório:', error.message);
        alert(`Erro ao enviar relatório: ${error.message}`);
    } else {
        alert('Relatório enviado com sucesso!');
        document.getElementById('formRelatorio').reset();
        await carregarRelatorios();
    }
}

// Função para carregar e renderizar os relatórios na tela
async function carregarRelatorios() {
    const { data, error } = await _supabase
        .from('relatorios')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Erro ao carregar relatórios:', error.message);
        alert('Erro ao carregar relatórios.');
        return;
    }

    const listaRelatorios = document.getElementById('listaRelatorios');
    listaRelatorios.innerHTML = '';

    data.forEach((relatorio) => {
        const item = document.createElement('div');
        item.className = 'bg-gray-100 p-4 mb-4 rounded shadow';

        item.innerHTML = `
            <h3 class="text-xl font-semibold">${relatorio.nome}</h3>
            <p><strong>Atualizações:</strong> ${relatorio.atualizacoes}</p>
            <p><strong>Localização:</strong> ${relatorio.localizacao}</p>
            <p><strong>Status:</strong> ${relatorio.status}</p>
            <p><strong>Assinatura:</strong> ${relatorio.assinado ? 'Sim' : 'Não'}</p> <!-- Exibe "Sim" ou "Não" -->
            <p><strong>Data:</strong> ${new Date(relatorio.created_at).toLocaleString()}</p>
            <div class="mt-2 grid grid-cols-3 gap-2">
                ${relatorio.imagens.map(url => `
                    <img src="${url}" alt="Imagem" class="w-full h-auto cursor-pointer rounded" onclick="abrirImagemModal('${url}')" />
                `).join('')}
            </div>
        `;

        listaRelatorios.appendChild(item);
    });
}

// Função para abrir a imagem em um modal
function abrirImagemModal(url) {
    const modal = document.getElementById('modal');
    const modalImg = document.getElementById('modalImg');
    modal.style.display = 'flex';
    modalImg.src = url;
}

// Função para fechar o modal
function fecharModal() {
    const modal = document.getElementById('modal');
    modal.style.display = 'none';
}

// Renderiza a tela do fiscal
export function renderFiscalScreen() {
    const app = document.getElementById('app');
    app.innerHTML = `
        <div class="bg-white p-6 rounded-lg shadow-md max-w-md mx-auto">
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-2xl font-semibold">Painel do Fiscal</h2>
                <button id="logoutButton" class="bg-red-500 text-white px-4 py-2 rounded">Logout</button>
            </div>

            <form id="formRelatorio">
                <div class="mb-4">
                    <label for="nomeRelatorio" class="block text-gray-700">Nome do Relatório:</label>
                    <input type="text" id="nomeRelatorio" class="border p-2 w-full" required />
                </div>

                <div class="mb-4">
                    <label for="atualizacoes" class="block text-gray-700">Atualizações:</label>
                    <textarea id="atualizacoes" class="border p-2 w-full" required></textarea>
                </div>

                <div class="mb-4">
                    <label for="localizacao" class="block text-gray-700">Localização:</label>
                    <input type="text" id="localizacao" class="border p-2 w-full" />
                </div>

                <div class="mb-4">
                    <label for="imagens" class="block text-gray-700">Imagens:</label>
                    <input type="file" id="imagens" class="border p-2 w-full" multiple />
                </div>

                <button type="submit" class="bg-blue-500 text-white py-2 px-4 rounded w-full">
                    Enviar Relatório
                </button>
            </form>

            <div id="listaRelatorios" class="mt-6"></div>
        </div>

        <!-- Modal para visualizar a imagem em tamanho completo -->
        <div id="modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center hidden">
            <span class="absolute top-4 right-4 text-white text-2xl cursor-pointer" onclick="fecharModal()">&times;</span>
            <img id="modalImg" class="max-w-full max-h-full rounded-lg" />
        </div>
    `;

    document.getElementById('logoutButton').addEventListener('click', logoutUser);
    document.getElementById('formRelatorio').addEventListener('submit', async (e) => {
        e.preventDefault();
        await enviarRelatorio();
    });

    carregarRelatorios();
}
