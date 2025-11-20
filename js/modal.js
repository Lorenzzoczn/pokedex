/**
 * MODAL MANAGER
 * Gerenciamento do modal de detalhes do Pokémon
 */

// Elementos do DOM
let modal;
let modalOverlay;
let modalClose;
let modalBody;

/**
 * Inicializa o modal
 */
function initModal() {
    // Buscar elementos do DOM
    modal = document.getElementById('pokemonModal');
    modalOverlay = document.getElementById('modalOverlay');
    modalClose = document.getElementById('modalClose');
    modalBody = document.getElementById('modalBody');
    
    // Adicionar event listeners
    modalClose.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', closeModal);
    
    // Fechar modal com tecla ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });
}

/**
 * Abre o modal com os detalhes do Pokémon
 * @param {Object} pokemon - Dados formatados do Pokémon
 */
async function openModal(pokemon) {
    // Mostrar loader no modal
    modalBody.innerHTML = '<div class="loader"><div class="pokeball-loader"><div class="pokeball-loader-inner"></div></div><p>Carregando detalhes...</p></div>';
    
    // Abrir modal
    modal.classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevenir scroll do body
    
    try {
        // Buscar detalhes completos se necessário
        const pokemonData = await getPokemonDetails(pokemon.id);
        const formattedData = formatPokemonData(pokemonData);
        
        // Buscar melhores movimentos
        const bestMoves = await getBestMoves(pokemonData.moves, 4);
        formattedData.bestMoves = bestMoves;
        
        // Renderizar conteúdo do modal
        renderModalContent(formattedData);
    } catch (error) {
        console.error('Erro ao carregar detalhes:', error);
        modalBody.innerHTML = '<div class="error-message"><i class="fas fa-exclamation-triangle"></i><p>Erro ao carregar detalhes do Pokémon</p></div>';
    }
}

/**
 * Fecha o modal
 */
function closeModal() {
    modal.classList.remove('active');
    document.body.style.overflow = ''; // Restaurar scroll do body
    
    // Limpar conteúdo após animação
    setTimeout(() => {
        modalBody.innerHTML = '';
    }, 300);
}

/**
 * Renderiza o conteúdo do modal
 * @param {Object} pokemon - Dados formatados do Pokémon
 */
function renderModalContent(pokemon) {
    const typesHTML = pokemon.types.map(type => 
        `<span class="pokemon-type type-${type}">${TYPE_TRANSLATIONS[type] || type}</span>`
    ).join('');
    
    const statsHTML = pokemon.stats.map(stat => {
        const percentage = (stat.value / 255) * 100; // 255 é o valor máximo de stat
        return `
            <div class="stat-item">
                <div class="stat-name">${STAT_TRANSLATIONS[stat.name] || stat.name}</div>
                <div class="stat-bar-container">
                    <div class="stat-bar" style="width: ${percentage}%">
                        <span class="stat-value">${stat.value}</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    const abilitiesHTML = pokemon.abilities.map(ability => 
        `<span class="ability-badge">${ability.replace('-', ' ')}</span>`
    ).join('');
    
    // Renderizar melhores ataques
    let movesHTML = '';
    if (pokemon.bestMoves && pokemon.bestMoves.length > 0) {
        movesHTML = pokemon.bestMoves.map(move => `
            <div class="move-card">
                <div class="move-header">
                    <span class="move-name">${move.namePt}</span>
                    <span class="pokemon-type type-${move.type}">${TYPE_TRANSLATIONS[move.type] || move.type}</span>
                </div>
                <div class="move-stats">
                    <div class="move-stat">
                        <span class="move-stat-label">Poder</span>
                        <span class="move-stat-value">${move.power}</span>
                    </div>
                    <div class="move-stat">
                        <span class="move-stat-label">Precisão</span>
                        <span class="move-stat-value">${move.accuracy || '-'}%</span>
                    </div>
                    <div class="move-stat">
                        <span class="move-stat-label">PP</span>
                        <span class="move-stat-value">${move.pp}</span>
                    </div>
                </div>
                <div class="move-class">
                    <i class="fas ${move.damageClass === 'physical' ? 'fa-fist-raised' : move.damageClass === 'special' ? 'fa-magic' : 'fa-shield-alt'}"></i>
                    ${move.damageClass === 'physical' ? 'Físico' : move.damageClass === 'special' ? 'Especial' : 'Status'}
                </div>
            </div>
        `).join('');
    } else {
        movesHTML = '<p class="no-moves">Carregando ataques...</p>';
    }
    
    modalBody.innerHTML = `
        <div class="modal-header">
            <div class="modal-pokemon-number">${pokemon.number}</div>
            <h2 class="modal-pokemon-name">${pokemon.name}</h2>
            <img src="${pokemon.image}" alt="${pokemon.name}" class="modal-pokemon-image">
            <div class="modal-pokemon-types">
                ${typesHTML}
            </div>
        </div>
        
        <div class="modal-info">
            <!-- Informações Básicas -->
            <div class="modal-section">
                <h3 class="modal-section-title">Informações Básicas</h3>
                <div class="modal-basic-info">
                    <div class="info-item">
                        <div class="info-label">Altura</div>
                        <div class="info-value">${pokemon.height} m</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Peso</div>
                        <div class="info-value">${pokemon.weight} kg</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Experiência Base</div>
                        <div class="info-value">${pokemon.baseExperience || 'N/A'}</div>
                    </div>
                </div>
            </div>
            
            <!-- Stats -->
            <div class="modal-section">
                <h3 class="modal-section-title">Estatísticas Base</h3>
                <div class="modal-stats">
                    ${statsHTML}
                </div>
            </div>
            
            <!-- Habilidades -->
            <div class="modal-section">
                <h3 class="modal-section-title">Habilidades</h3>
                <div class="modal-abilities">
                    ${abilitiesHTML}
                </div>
            </div>
            
            <!-- Melhores Ataques -->
            <div class="modal-section">
                <h3 class="modal-section-title">
                    <i class="fas fa-bolt"></i> Melhores Ataques
                </h3>
                <div class="modal-moves">
                    ${movesHTML}
                </div>
            </div>
        </div>
    `;
}

// Inicializar quando o DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initModal);
} else {
    initModal();
}

// Exportar funções (para uso em outros arquivos)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initModal,
        openModal,
        closeModal,
        renderModalContent
    };
}
