// js/app.js
import { renderLoginScreen } from './telas/login.js';
import { renderCadastroScreen } from './telas/cadastro.js';
import { renderAdminScreen } from './telas/admin.js';
import { renderClientScreen } from './telas/cliente.js';
import { renderFiscalScreen } from './telas/fiscal.js';
import { _supabase } from './supabase.js';

// Função para salvar o usuário autenticado no localStorage
function saveAuthenticatedUser(user) {
    localStorage.setItem('authenticatedUser', JSON.stringify(user));
}

// Função para recuperar o usuário autenticado do localStorage
function getAuthenticatedUser() {
    return JSON.parse(localStorage.getItem('authenticatedUser'));
}

// Função para remover o usuário autenticado (logout)
function logoutUser() {
    localStorage.removeItem('authenticatedUser');
    navigateTo('login');
}

// Função para adicionar usuário ao Supabase
async function addUser(user) {
    const { error } = await _supabase.from('usuarios').insert([user]);

    if (error) {
        console.error("Erro ao adicionar usuário:", error.message);
        alert("Erro ao cadastrar usuário.");
        return false;
    }
    alert("Usuário cadastrado com sucesso!");
    return true;
}

// Função para verificar o login
async function loginUser(email, password) {
    const { data: user, error } = await _supabase
        .from('usuarios')
        .select('*')
        .eq('email', email)
        .eq('senha', password)
        .single();

    if (error || !user) {
        alert("Email ou senha inválidos");
        return false;
    }

    saveAuthenticatedUser(user); // Salva o usuário autenticado
    navigateTo(user.cargo.toLowerCase()); // Navega para a tela com base no tipo de usuário
    return true;
}

// Função para navegar para diferentes telas
function navigateTo(screen) {
    const authenticatedUser = getAuthenticatedUser();

    // Redireciona automaticamente se o usuário já estiver autenticado
    if (authenticatedUser) {
        const roleScreen = authenticatedUser.cargo.toLowerCase();
        if (screen === 'login') screen = roleScreen;
    }

    // Se o usuário não for administrador e tentar acessar a tela de cadastro
    if (screen === 'cadastro' && authenticatedUser && authenticatedUser.cargo !== 'Administrador') {
        alert("Acesso negado! Apenas administradores podem cadastrar usuários.");
        screen = authenticatedUser.cargo.toLowerCase(); // Redireciona para a tela do usuário
    }

    // Renderiza a tela com base no valor de `screen`
    if (screen === 'login') {
        renderLoginScreen();
    } else if (screen === 'cadastro') {
        renderCadastroScreen();
    } else if (screen === 'administrador') {
        renderAdminScreen();
    } else if (screen === 'cliente') {
        renderClientScreen();
    } else if (screen === 'fiscal') {
        renderFiscalScreen();
    }
}

// Inicializa o aplicativo na tela de login ou na tela do usuário autenticado
const authenticatedUser = getAuthenticatedUser();
navigateTo(authenticatedUser ? authenticatedUser.cargo.toLowerCase() : 'login');

// Exporta as funções para que outros módulos possam usá-las
export { navigateTo, addUser, loginUser, logoutUser, getAuthenticatedUser };
