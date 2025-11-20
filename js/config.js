/**
 * CONFIGURAÇÕES DA APLICAÇÃO
 * Constantes e configurações globais da Pokédex
 */

// URL base da PokéAPI
const API_BASE_URL = 'https://pokeapi.co/api/v2';

// Configurações de paginação
const POKEMONS_PER_PAGE = 20; // Quantidade de Pokémons por página
const INITIAL_OFFSET = 0; // Offset inicial

// Limite máximo de Pokémons (Geração 1-9)
const MAX_POKEMONS = 1025;

// Configuração de gerações de Pokémon
const GENERATIONS = {
    1: { name: 'Kanto', start: 1, end: 151 },
    2: { name: 'Johto', start: 152, end: 251 },
    3: { name: 'Hoenn', start: 252, end: 386 },
    4: { name: 'Sinnoh', start: 387, end: 493 },
    5: { name: 'Unova', start: 494, end: 649 },
    6: { name: 'Kalos', start: 650, end: 721 },
    7: { name: 'Alola', start: 722, end: 809 },
    8: { name: 'Galar', start: 810, end: 905 },
    9: { name: 'Paldea', start: 906, end: 1025 }
};

// Configuração de cache (opcional - para melhorar performance)
const CACHE_ENABLED = true;
const CACHE_DURATION = 3600000; // 1 hora em milissegundos

// Traduções de stats para português
const STAT_TRANSLATIONS = {
    'hp': 'HP',
    'attack': 'Ataque',
    'defense': 'Defesa',
    'special-attack': 'Atq. Especial',
    'special-defense': 'Def. Especial',
    'speed': 'Velocidade'
};

// Traduções de tipos para português (opcional)
const TYPE_TRANSLATIONS = {
    'normal': 'Normal',
    'fire': 'Fogo',
    'water': 'Água',
    'electric': 'Elétrico',
    'grass': 'Planta',
    'ice': 'Gelo',
    'fighting': 'Lutador',
    'poison': 'Veneno',
    'ground': 'Terra',
    'flying': 'Voador',
    'psychic': 'Psíquico',
    'bug': 'Inseto',
    'rock': 'Pedra',
    'ghost': 'Fantasma',
    'dragon': 'Dragão',
    'dark': 'Sombrio',
    'steel': 'Metálico',
    'fairy': 'Fada'
};

// Exportar configurações (para uso em outros arquivos)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        API_BASE_URL,
        POKEMONS_PER_PAGE,
        INITIAL_OFFSET,
        MAX_POKEMONS,
        GENERATIONS,
        CACHE_ENABLED,
        CACHE_DURATION,
        STAT_TRANSLATIONS,
        TYPE_TRANSLATIONS
    };
}
