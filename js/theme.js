/**
 * THEME MANAGER
 * Gerenciamento de tema claro/escuro
 */

// Chave para armazenar preferência no localStorage
const THEME_STORAGE_KEY = 'pokedex-theme';

// Elementos do DOM
let themeToggleBtn;
let themeIcon;

/**
 * Inicializa o gerenciador de tema
 */
function initTheme() {
    // Buscar elementos do DOM
    themeToggleBtn = document.getElementById('themeToggle');
    themeIcon = themeToggleBtn.querySelector('i');
    
    // Carregar tema salvo ou usar preferência do sistema
    const savedTheme = getSavedTheme();
    const systemTheme = getSystemTheme();
    const initialTheme = savedTheme || systemTheme;
    
    // Aplicar tema inicial
    setTheme(initialTheme, false);
    
    // Adicionar event listener ao botão
    themeToggleBtn.addEventListener('click', toggleTheme);
    
    // Observar mudanças na preferência do sistema
    watchSystemTheme();
}

/**
 * Obtém o tema salvo no localStorage
 * @returns {string|null} - 'light', 'dark' ou null
 */
function getSavedTheme() {
    return localStorage.getItem(THEME_STORAGE_KEY);
}

/**
 * Obtém a preferência de tema do sistema
 * @returns {string} - 'light' ou 'dark'
 */
function getSystemTheme() {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
    }
    return 'light';
}

/**
 * Define o tema da aplicação
 * @param {string} theme - 'light' ou 'dark'
 * @param {boolean} save - Se deve salvar no localStorage
 */
function setTheme(theme, save = true) {
    // Aplicar tema no documento
    document.documentElement.setAttribute('data-theme', theme);
    
    // Atualizar ícone do botão
    updateThemeIcon(theme);
    
    // Salvar preferência se solicitado
    if (save) {
        localStorage.setItem(THEME_STORAGE_KEY, theme);
    }
    
    // Log para debug
    console.log(`Tema alterado para: ${theme}`);
}

/**
 * Alterna entre tema claro e escuro
 */
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    // Adicionar animação ao botão
    themeToggleBtn.style.transform = 'rotate(360deg)';
    setTimeout(() => {
        themeToggleBtn.style.transform = 'rotate(0deg)';
    }, 300);
    
    setTheme(newTheme);
}

/**
 * Atualiza o ícone do botão de tema
 * @param {string} theme - 'light' ou 'dark'
 */
function updateThemeIcon(theme) {
    if (theme === 'dark') {
        themeIcon.classList.remove('fa-moon');
        themeIcon.classList.add('fa-sun');
    } else {
        themeIcon.classList.remove('fa-sun');
        themeIcon.classList.add('fa-moon');
    }
}

/**
 * Observa mudanças na preferência de tema do sistema
 */
function watchSystemTheme() {
    if (window.matchMedia) {
        const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
        
        // Listener para mudanças
        darkModeQuery.addEventListener('change', (e) => {
            // Só aplicar se não houver preferência salva
            if (!getSavedTheme()) {
                const newTheme = e.matches ? 'dark' : 'light';
                setTheme(newTheme, false);
            }
        });
    }
}

/**
 * Reseta o tema para a preferência do sistema
 */
function resetTheme() {
    localStorage.removeItem(THEME_STORAGE_KEY);
    const systemTheme = getSystemTheme();
    setTheme(systemTheme, false);
}

// Inicializar quando o DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTheme);
} else {
    initTheme();
}

// Exportar funções (para uso em outros arquivos)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initTheme,
        setTheme,
        toggleTheme,
        resetTheme,
        getSavedTheme,
        getSystemTheme
    };
}
