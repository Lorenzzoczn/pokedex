/**
 * API SERVICE
 * Funções para consumir a PokéAPI
 */

// Cache simples para armazenar dados já buscados
const pokemonCache = new Map();

/**
 * Função genérica para fazer requisições à API
 * @param {string} url - URL completa da requisição
 * @returns {Promise<Object>} - Dados da resposta
 */
async function fetchAPI(url) {
    try {
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Erro ao buscar dados da API:', error);
        throw error;
    }
}

/**
 * Busca uma lista de Pokémons com paginação
 * @param {number} limit - Quantidade de Pokémons a buscar
 * @param {number} offset - Offset para paginação
 * @returns {Promise<Object>} - Lista de Pokémons
 */
async function getPokemonList(limit = POKEMONS_PER_PAGE, offset = 0) {
    const url = `${API_BASE_URL}/pokemon?limit=${limit}&offset=${offset}`;
    return await fetchAPI(url);
}

/**
 * Busca detalhes de um Pokémon específico
 * @param {string|number} pokemonId - Nome ou ID do Pokémon
 * @returns {Promise<Object>} - Dados completos do Pokémon
 */
async function getPokemonDetails(pokemonId) {
    // Verificar cache primeiro
    if (CACHE_ENABLED && pokemonCache.has(pokemonId)) {
        console.log(`Pokémon ${pokemonId} carregado do cache`);
        return pokemonCache.get(pokemonId);
    }
    
    const url = `${API_BASE_URL}/pokemon/${pokemonId}`;
    const data = await fetchAPI(url);
    
    // Armazenar no cache
    if (CACHE_ENABLED) {
        pokemonCache.set(pokemonId, data);
    }
    
    return data;
}

/**
 * Busca informações da espécie do Pokémon (para descrição, etc)
 * @param {number} pokemonId - ID do Pokémon
 * @returns {Promise<Object>} - Dados da espécie
 */
async function getPokemonSpecies(pokemonId) {
    const url = `${API_BASE_URL}/pokemon-species/${pokemonId}`;
    return await fetchAPI(url);
}

/**
 * Busca um Pokémon por nome ou ID (para a busca)
 * @param {string} searchTerm - Termo de busca (nome ou ID)
 * @returns {Promise<Object>} - Dados do Pokémon encontrado
 */
async function searchPokemon(searchTerm) {
    // Converter para minúsculas e remover espaços
    const term = searchTerm.toLowerCase().trim();
    
    try {
        return await getPokemonDetails(term);
    } catch (error) {
        throw new Error('Pokémon não encontrado');
    }
}

/**
 * Formata os dados do Pokémon para exibição
 * @param {Object} pokemonData - Dados brutos da API
 * @returns {Object} - Dados formatados
 */
function formatPokemonData(pokemonData) {
    return {
        id: pokemonData.id,
        name: pokemonData.name,
        number: `#${String(pokemonData.id).padStart(3, '0')}`,
        image: pokemonData.sprites.other['official-artwork'].front_default || 
               pokemonData.sprites.front_default,
        types: pokemonData.types.map(type => type.type.name),
        height: pokemonData.height / 10, // Converter para metros
        weight: pokemonData.weight / 10, // Converter para kg
        abilities: pokemonData.abilities.map(ability => ability.ability.name),
        stats: pokemonData.stats.map(stat => ({
            name: stat.stat.name,
            value: stat.base_stat
        })),
        baseExperience: pokemonData.base_experience
    };
}

/**
 * Busca múltiplos Pokémons em paralelo
 * @param {Array} pokemonUrls - Array de URLs dos Pokémons
 * @returns {Promise<Array>} - Array com dados dos Pokémons
 */
async function fetchMultiplePokemons(pokemonUrls) {
    const promises = pokemonUrls.map(url => fetchAPI(url));
    return await Promise.all(promises);
}

/**
 * Busca detalhes de um movimento específico
 * @param {string} moveUrl - URL do movimento
 * @returns {Promise<Object>} - Dados do movimento
 */
async function getMoveDetails(moveUrl) {
    return await fetchAPI(moveUrl);
}

/**
 * Busca os melhores movimentos de um Pokémon
 * @param {Array} moves - Array de movimentos do Pokémon
 * @param {number} limit - Quantidade de movimentos a retornar
 * @returns {Promise<Array>} - Array com os melhores movimentos
 */
async function getBestMoves(moves, limit = 4) {
    // Filtrar apenas movimentos aprendidos por level-up ou machine
    const learnableMoves = moves.filter(move => {
        const methods = move.version_group_details.map(v => v.move_learn_method.name);
        return methods.includes('level-up') || methods.includes('machine');
    });
    
    // Limitar a quantidade de requisições para não sobrecarregar
    const movesToFetch = learnableMoves.slice(0, Math.min(20, learnableMoves.length));
    
    try {
        // Buscar detalhes dos movimentos em paralelo
        const moveDetailsPromises = movesToFetch.map(move => getMoveDetails(move.move.url));
        const moveDetails = await Promise.all(moveDetailsPromises);
        
        // Ordenar por poder (power) e filtrar movimentos sem poder
        const sortedMoves = moveDetails
            .filter(move => move.power !== null && move.power > 0)
            .sort((a, b) => b.power - a.power)
            .slice(0, limit);
        
        // Formatar dados dos movimentos
        return sortedMoves.map(move => ({
            name: move.name,
            namePt: translateMoveName(move.name),
            type: move.type.name,
            power: move.power,
            accuracy: move.accuracy,
            pp: move.pp,
            damageClass: move.damage_class.name
        }));
    } catch (error) {
        console.error('Erro ao buscar movimentos:', error);
        return [];
    }
}

/**
 * Traduz nomes de movimentos comuns para português
 * @param {string} moveName - Nome do movimento em inglês
 * @returns {string} - Nome traduzido ou original
 */
function translateMoveName(moveName) {
    const translations = {
        'thunderbolt': 'Raio',
        'flamethrower': 'Lança-chamas',
        'hydro-pump': 'Hidro Bomba',
        'solar-beam': 'Raio Solar',
        'earthquake': 'Terremoto',
        'psychic': 'Psíquico',
        'ice-beam': 'Raio de Gelo',
        'thunder': 'Trovão',
        'fire-blast': 'Explosão de Fogo',
        'blizzard': 'Nevasca',
        'hyper-beam': 'Hiper Raio',
        'surf': 'Surf',
        'shadow-ball': 'Bola Sombria',
        'dragon-claw': 'Garra de Dragão',
        'stone-edge': 'Lâmina de Pedra',
        'close-combat': 'Combate Próximo',
        'iron-head': 'Cabeça de Ferro',
        'play-rough': 'Carícia',
        'moonblast': 'Força Lunar',
        'dark-pulse': 'Pulso Sombrio',
        'energy-ball': 'Bola de Energia',
        'flash-cannon': 'Canhão Flash',
        'focus-blast': 'Onda de Choque',
        'giga-impact': 'Giga Impacto',
        'leaf-storm': 'Tempestade de Folhas',
        'outrage': 'Fúria',
        'power-whip': 'Chicote de Poder',
        'sludge-bomb': 'Bomba de Lodo',
        'wild-charge': 'Carga Selvagem',
        'x-scissor': 'Tesoura X',
        'aerial-ace': 'Ás Aéreo',
        'aqua-tail': 'Cauda Aquática',
        'brave-bird': 'Pássaro Bravo',
        'crunch': 'Triturar',
        'drill-peck': 'Bico Broca',
        'drill-run': 'Perfurar',
        'dazzling-gleam': 'Brilho Mágico'
    };
    
    return translations[moveName] || moveName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

/**
 * Limpa o cache de Pokémons
 */
function clearCache() {
    pokemonCache.clear();
    console.log('Cache limpo');
}

// Exportar funções (para uso em outros arquivos)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        fetchAPI,
        getPokemonList,
        getPokemonDetails,
        getPokemonSpecies,
        searchPokemon,
        formatPokemonData,
        fetchMultiplePokemons,
        getMoveDetails,
        getBestMoves,
        translateMoveName,
        clearCache
    };
}
