import { logoutUser, getAuthenticatedUser } from '../app.js';
import { _supabase } from '../supabase.js';

// Função para carregar as obras para o seletor
async function carregarObras() {
    const { data: obras, error } = await _supabase.from('obras').select('id, nome_da_obra, endereco');
    if (error) {
        console.error('Erro ao carregar obras:', error.message);
        return [];
    }
    return obras;
}

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
    const obraId = document.getElementById('obraSelect').value;
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
        obra_id: obraId,
        nome,
        atualizacoes,
        localizacao,
        imagens: urlsImagens,
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
        .select(`
            *,
            obras (nome_da_obra, endereco)
        `)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Erro ao carregar relatórios:', error.message);
        alert('Erro ao carregar relatórios.');
        return;
    }

    const listaRelatorios = document.getElementById('listaRelatorios');
    listaRelatorios.innerHTML = '';

    data.forEach((relatorio, index) => {
        const obra = relatorio.obras || {};
        const nomeDaObra = obra.nome_da_obra || 'Obra não encontrada';
        const endereco = obra.endereco || 'Endereço não disponível';

        const item = document.createElement('div');
        item.className = 'bg-gray-100 p-4 mb-4 rounded shadow';

        item.innerHTML = `
            <h3 class="text-xl font-semibold">${relatorio.nome}</h3>
            <p><strong>Atualizações:</strong> ${relatorio.atualizacoes}</p>
            <p><strong>Obra:</strong> ${nomeDaObra}</p>
            <p><strong>Endereço:</strong> ${endereco}</p>
            <p><strong>Data:</strong> ${new Date(relatorio.created_at).toLocaleString()}</p>
            <div class="mt-2">
                <img src="${relatorio.imagens[0]}" alt="Imagem" class="w-full h-auto cursor-pointer rounded" onclick="abrirCarrossel(${index})" />
            </div>
        `;
        listaRelatorios.appendChild(item);
    });

    // Armazena dados dos relatórios para o carrossel
    window.relatoriosData = data;
}

// Função para abrir o modal do carrossel e definir a primeira imagem
function abrirCarrossel(relatorioIndex) {
    window.carrosselIndex = 0;
    window.relatorioAtualIndex = relatorioIndex;

    const modal = document.getElementById('modal');
    const modalImg = document.getElementById('modalImg');
    const relatorio = window.relatoriosData[relatorioIndex];
    modalImg.src = relatorio.imagens[window.carrosselIndex];
    modal.style.display = 'flex';
}

// Função para fechar o modal
function fecharModal() {
    const modal = document.getElementById('modal');
    modal.style.display = 'none';
}

// Função para ir para a próxima imagem no carrossel
function proximaImagem() {
    const relatorio = window.relatoriosData[window.relatorioAtualIndex];
    window.carrosselIndex = (window.carrosselIndex + 1) % relatorio.imagens.length;
    document.getElementById('modalImg').src = relatorio.imagens[window.carrosselIndex];
}

// Função para ir para a imagem anterior no carrossel
function imagemAnterior() {
    const relatorio = window.relatoriosData[window.relatorioAtualIndex];
    window.carrosselIndex = (window.carrosselIndex - 1 + relatorio.imagens.length) % relatorio.imagens.length;
    document.getElementById('modalImg').src = relatorio.imagens[window.carrosselIndex];
}

// Tornando funções globais
window.abrirCarrossel = abrirCarrossel;
window.fecharModal = fecharModal;
window.proximaImagem = proximaImagem;
window.imagemAnterior = imagemAnterior;

// Renderiza a tela do fiscal
export async function renderFiscalScreen() {
    const obras = await carregarObras();
    const app = document.getElementById('app');

    app.innerHTML = `
        <div class="bg-white p-6 rounded-lg shadow-md max-w-md mx-auto">
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-2xl font-semibold">Painel do Fiscal</h2>
                <button id="logoutButton" class="bg-red-500 text-white px-4 py-2 rounded">Logout</button>
            </div>

            <form id="formRelatorio">
                <div class="mb-4">
                    <label for="obraSelect" class="block text-gray-700">Selecionar Obra:</label>
                    <select id="obraSelect" class="border p-2 w-full" required>
                        <option value="">Selecione uma obra</option>
                        ${obras.map(obra => `<option value="${obra.id}" data-endereco="${obra.endereco}">${obra.nome_da_obra}</option>`).join('')}
                    </select>
                </div>

                <div class="mb-4">
                    <label for="nomeRelatorio" class="block text-gray-700">Nome do Relatório:</label>
                    <input type="text" id="nomeRelatorio" class="border p-2 w-full" required />
                </div>

                <div class="mb-4">
                    <label for="atualizacoes" class="block text-gray-700">Atualizações:</label>
                    <textarea id="atualizacoes" class="border p-2 w-full" required></textarea>
                </div>

                <div class="mb-4">
                    <label for="localizacao" class="block text-gray-700">Endereço:</label>
                    <input type="text" id="localizacao" class="border p-2 w-full" readonly />
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

        <!-- Modal para visualizar o carrossel de imagens -->
        <div id="modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center hidden">
            <span class="absolute top-4 right-4 text-white text-2xl cursor-pointer" onclick="fecharModal()">&times;</span>
            <button class="absolute left-4 text-white text-2xl cursor-pointer" onclick="imagemAnterior()">&#10094;</button>
            <img id="modalImg" class="max-w-full max-h-full rounded-lg" />
            <button class="absolute right-4 text-white text-2xl cursor-pointer" onclick="proximaImagem()">&#10095;</button>
        </div>
    `;

    document.getElementById('obraSelect').addEventListener('change', (e) => {
        const selectedOption = e.target.options[e.target.selectedIndex];
        const endereco = selectedOption.getAttribute('data-endereco');
        document.getElementById('localizacao').value = endereco || '';
    });

    document.getElementById('logoutButton').addEventListener('click', logoutUser);
    document.getElementById('formRelatorio').addEventListener('submit', async (e) => {
        e.preventDefault();
        await enviarRelatorio();
    });

    carregarRelatorios();
}
