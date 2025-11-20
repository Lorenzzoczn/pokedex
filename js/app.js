/**
 * APLICAÇÃO PRINCIPAL
 * Lógica principal da Pokédex
 */

// Estado da aplicação
const appState = {
    currentOffset: INITIAL_OFFSET,
    currentPage: 1,
    totalPages: Math.ceil(MAX_POKEMONS / POKEMONS_PER_PAGE),
    isLoading: false,
    searchMode: false,
    selectedGeneration: 'all',
    generationStart: 1,
    generationEnd: MAX_POKEMONS
};

// Elementos do DOM
let pokemonList;
let loader;
let errorMessage;
let searchInput;
let searchBtn;
let prevBtn;
let nextBtn;
let paginationInfo;
let generationButtons;

/**
 * Inicializa a aplicação
 */
function initApp() {
    // Buscar elementos do DOM
    pokemonList = document.getElementById('pokemonList');
    loader = document.getElementById('loader');
    errorMessage = document.getElementById('errorMessage');
    searchInput = document.getElementById('searchInput');
    searchBtn = document.getElementById('searchBtn');
    prevBtn = document.getElementById('prevBtn');
    nextBtn = document.getElementById('nextBtn');
    paginationInfo = document.getElementById('paginationInfo');
    generationButtons = document.querySelectorAll('.gen-btn');
    
    // Adicionar event listeners
    searchBtn.addEventListener('click', handleSearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    });
    
    // Limpar busca ao apagar o input
    searchInput.addEventListener('input', (e) => {
        if (e.target.value === '' && appState.searchMode) {
            exitSearchMode();
        }
    });
    
    prevBtn.addEventListener('click', handlePrevPage);
    nextBtn.addEventListener('click', handleNextPage);
    
    // Event listeners para filtro de geração
    generationButtons.forEach(btn => {
        btn.addEventListener('click', () => handleGenerationFilter(btn));
    });
    
    // Carregar primeira página
    loadPokemons();
}

/**
 * Carrega a lista de Pokémons
 */
async function loadPokemons() {
    if (appState.isLoading) return;
    
    appState.isLoading = true;
    showLoader();
    hideError();
    
    try {
        let pokemonDetails;
        
        if (appState.selectedGeneration === 'all') {
            // Buscar lista de Pokémons com paginação normal
            const data = await getPokemonList(POKEMONS_PER_PAGE, appState.currentOffset);
            pokemonDetails = await fetchMultiplePokemons(data.results.map(p => p.url));
        } else {
            // Buscar Pokémons da geração específica
            pokemonDetails = await loadPokemonsByGeneration();
        }
        
        // Formatar dados
        const formattedPokemons = pokemonDetails.map(formatPokemonData);
        
        // Renderizar cards
        renderPokemonCards(formattedPokemons);
        
        // Atualizar paginação
        updatePagination();
        
    } catch (error) {
        console.error('Erro ao carregar Pokémons:', error);
        showError('Erro ao carregar Pokémons. Tente novamente.');
    } finally {
        appState.isLoading = false;
        hideLoader();
    }
}

/**
 * Carrega Pokémons de uma geração específica
 */
async function loadPokemonsByGeneration() {
    const start = appState.generationStart + appState.currentOffset;
    const end = Math.min(start + POKEMONS_PER_PAGE, appState.generationEnd + 1);
    
    const promises = [];
    for (let i = start; i < end; i++) {
        promises.push(getPokemonDetails(i));
    }
    
    return await Promise.all(promises);
}

/**
 * Renderiza os cards de Pokémon
 * @param {Array} pokemons - Array de Pokémons formatados
 */
function renderPokemonCards(pokemons) {
    // Limpar lista
    pokemonList.innerHTML = '';
    
    // Criar cards
    pokemons.forEach(pokemon => {
        const card = createPokemonCard(pokemon);
        pokemonList.appendChild(card);
    });
}

/**
 * Cria um card de Pokémon
 * @param {Object} pokemon - Dados formatados do Pokémon
 * @returns {HTMLElement} - Elemento do card
 */
function createPokemonCard(pokemon) {
    const card = document.createElement('div');
    card.className = 'pokemon-card';
    card.setAttribute('data-pokemon-id', pokemon.id);
    
    // Criar HTML do card
    const typesHTML = pokemon.types.map(type => 
        `<span class="pokemon-type type-${type}">${TYPE_TRANSLATIONS[type] || type}</span>`
    ).join('');
    
    card.innerHTML = `
        <div class="pokemon-number">${pokemon.number}</div>
        <div class="pokemon-image-container">
            <img src="${pokemon.image}" alt="${pokemon.name}" class="pokemon-image" loading="lazy">
        </div>
        <h3 class="pokemon-name">${pokemon.name}</h3>
        <div class="pokemon-types">
            ${typesHTML}
        </div>
    `;
    
    // Adicionar evento de clique para abrir modal
    card.addEventListener('click', () => openModal(pokemon));
    
    // Adicionar animação de entrada
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    
    setTimeout(() => {
        card.style.transition = 'all 0.5s ease';
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
    }, 50);
    
    return card;
}

/**
 * Manipula a busca de Pokémon
 */
async function handleSearch() {
    const searchTerm = searchInput.value.trim();
    
    if (!searchTerm) {
        return;
    }
    
    appState.isLoading = true;
    appState.searchMode = true;
    showLoader();
    hideError();
    
    try {
        // Buscar Pokémon
        const pokemonData = await searchPokemon(searchTerm);
        const formattedPokemon = formatPokemonData(pokemonData);
        
        // Renderizar apenas o Pokémon encontrado
        renderPokemonCards([formattedPokemon]);
        
        // Esconder paginação no modo busca
        prevBtn.style.display = 'none';
        nextBtn.style.display = 'none';
        paginationInfo.textContent = 'Resultado da busca';
        
    } catch (error) {
        console.error('Erro na busca:', error);
        pokemonList.innerHTML = '';
        showError('Pokémon não encontrado. Tente outro nome ou número.');
    } finally {
        appState.isLoading = false;
        hideLoader();
    }
}

/**
 * Sai do modo de busca e volta para a listagem
 */
function exitSearchMode() {
    appState.searchMode = false;
    searchInput.value = '';
    prevBtn.style.display = '';
    nextBtn.style.display = '';
    loadPokemons();
}

/**
 * Manipula o filtro de geração
 * @param {HTMLElement} button - Botão clicado
 */
function handleGenerationFilter(button) {
    const generation = button.getAttribute('data-gen');
    
    // Atualizar botões ativos
    generationButtons.forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');
    
    // Resetar estado
    appState.currentPage = 1;
    appState.currentOffset = 0;
    appState.selectedGeneration = generation;
    
    if (generation === 'all') {
        // Todas as gerações
        appState.generationStart = 1;
        appState.generationEnd = MAX_POKEMONS;
        appState.totalPages = Math.ceil(MAX_POKEMONS / POKEMONS_PER_PAGE);
    } else {
        // Geração específica
        const genData = GENERATIONS[generation];
        appState.generationStart = genData.start;
        appState.generationEnd = genData.end;
        const totalInGen = genData.end - genData.start + 1;
        appState.totalPages = Math.ceil(totalInGen / POKEMONS_PER_PAGE);
    }
    
    // Sair do modo de busca se estiver ativo
    if (appState.searchMode) {
        exitSearchMode();
    } else {
        loadPokemons();
    }
}

/**
 * Manipula navegação para página anterior
 */
function handlePrevPage() {
    if (appState.currentPage > 1) {
        appState.currentPage--;
        
        if (appState.selectedGeneration === 'all') {
            appState.currentOffset -= POKEMONS_PER_PAGE;
        } else {
            appState.currentOffset -= POKEMONS_PER_PAGE;
        }
        
        loadPokemons();
        scrollToTop();
    }
}

/**
 * Manipula navegação para próxima página
 */
function handleNextPage() {
    if (appState.currentPage < appState.totalPages) {
        appState.currentPage++;
        
        if (appState.selectedGeneration === 'all') {
            appState.currentOffset += POKEMONS_PER_PAGE;
        } else {
            appState.currentOffset += POKEMONS_PER_PAGE;
        }
        
        loadPokemons();
        scrollToTop();
    }
}

/**
 * Atualiza os controles de paginação
 */
function updatePagination() {
    // Atualizar texto
    paginationInfo.textContent = `Página ${appState.currentPage} de ${appState.totalPages}`;
    
    // Atualizar botões
    prevBtn.disabled = appState.currentPage === 1;
    nextBtn.disabled = appState.currentPage === appState.totalPages;
}

/**
 * Rola a página para o topo suavemente
 */
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

/**
 * Mostra o loader
 */
function showLoader() {
    loader.style.display = 'block';
    pokemonList.style.display = 'none';
}

/**
 * Esconde o loader
 */
function hideLoader() {
    loader.style.display = 'none';
    pokemonList.style.display = 'grid';
}

/**
 * Mostra mensagem de erro
 * @param {string} message - Mensagem de erro
 */
function showError(message) {
    errorMessage.querySelector('p').textContent = message;
    errorMessage.style.display = 'block';
    pokemonList.style.display = 'none';
}

/**
 * Esconde mensagem de erro
 */
function hideError() {
    errorMessage.style.display = 'none';
}

/**
 * Tratamento de erros globais
 */
window.addEventListener('error', (e) => {
    console.error('Erro global:', e.error);
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('Promise rejeitada:', e.reason);
});

// Inicializar quando o DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}

// Exportar funções (para uso em outros arquivos)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initApp,
        loadPokemons,
        handleSearch,
        exitSearchMode,
        createPokemonCard,
        renderPokemonCards
    };
}
