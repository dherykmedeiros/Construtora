// js/app.js
import { renderLoginScreen } from './telas/login.js';
import { renderCadastroScreen } from './telas/cadastro.js';
import { renderAdminScreen } from './telas/admin.js';
import { renderClientScreen } from './telas/cliente.js';
import { renderFiscalScreen } from './telas/fiscal.js';

// Função para adicionar usuário ao localStorage
function addUser(user) {
    let users = JSON.parse(localStorage.getItem('users')) || [];
    users.push(user);
    localStorage.setItem('users', JSON.stringify(users));
}

// Função para recuperar usuário do localStorage
function getUserByEmail(email) {
    let users = JSON.parse(localStorage.getItem('users')) || [];
    return users.find(user => user.email === email);
}

// Função para verificar o login
function loginUser(email, password) {
    const user = getUserByEmail(email);
    if (user && user.password === password) {
        navigateTo(user.role); // Navega para a tela com base no tipo de usuário
        return true;
    }
    alert("Email ou senha inválidos");
    return false;
}

// Função para navegar para diferentes telas
function navigateTo(screen) {
    if (screen === 'login') {
        renderLoginScreen();
    } else if (screen === 'cadastro') {
        renderCadastroScreen();
    } else if (screen === 'admin') {
        renderAdminScreen();
    } else if (screen === 'cliente') {
        renderClientScreen();
    } else if (screen === 'fiscal') {
        renderFiscalScreen();
    }
}

// Inicializa na tela de login
navigateTo('login');

// Exporta as funções para que outros módulos possam usá-las
export { navigateTo, addUser, loginUser };
