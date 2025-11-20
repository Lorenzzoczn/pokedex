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
        clearCache
    };
}
