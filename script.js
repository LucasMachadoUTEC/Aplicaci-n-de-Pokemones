const pokemonList = document.getElementById('pokemon-list');
const searchInput = document.getElementById('search');
const searchButton = document.getElementById('search-button');
const myModal = document.getElementById('myModal');
const modalTitle = document.getElementById('modal-title');
const modalImage = document.getElementById('modal-image');
const modalAbilities = document.getElementById('modal-abilities');
const modalHeight = document.getElementById('modal-height');
const modalWeight = document.getElementById('modal-weight');
const close = document.getElementById('close');

let offset = 0; // Contador para la paginación
const limit = 10; // Número de Pokémon por página
let allPokemons = []; // Lista de todos los Pokémon
let filteredPokemons = []; // Lista de Pokémon filtrados

// Cargar Pokémon inicial
async function loadPokemons() {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=100`);
    const data = await response.json();
    allPokemons = data.results; // Guardar todos los Pokémon
    filteredPokemons = allPokemons; // Pokemones filtrados
    displayPokemons(filteredPokemons.slice(offset, limit)); // Mostrar los primeros pokemones
}

// Mostrar Pokémon en la lista
async function displayPokemons(pokemons) {
    pokemonList.innerHTML = ''; // Limpiar la lista
    for (const pokemon of pokemons) {
        await createPokemonCard(pokemon);
    }
}

// Crear tarjeta de Pokémon
async function createPokemonCard(pokemon) {
    const card = document.createElement('div');
    card.classList.add('pokemon-card');

    const name = pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1);

    // Obtener la imagen del Pokémon
    const pokemonResponse = await fetch(pokemon.url);
    const pokemonData = await pokemonResponse.json();
    const imgSrc = pokemonData.sprites.front_default; // URL de la imagen desde PokeAPI

    // Verificar si el Pokémon está en favoritos
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    const isFavorite = favorites.includes(name);

    card.innerHTML = `
        <img src="${imgSrc}" alt="${name}">
        <h3>${name}</h3>
        <button class="favorite-button ${isFavorite ? 'favorited' : ''}" onclick="markFavorite('${name}', this); event.stopPropagation();">Favoritos</button>
    `;
    
    card.addEventListener('click', () => loadPokemonDetails(pokemon.name));
    pokemonList.appendChild(card);
}

// Cargar detalles del Pokémon
async function loadPokemonDetails(name) {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
    const pokemon = await response.json();
    
    modalTitle.innerText = pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1);
    modalImage.src = pokemon.sprites.front_default; // Cambiar a la imagen de PokeAPI
    modalAbilities.innerText = pokemon.abilities.map(ability => ability.ability.name).join(', ');
    modalHeight.innerText = pokemon.height / 10 + ' m';
    modalWeight.innerText = pokemon.weight / 10 + ' kg';
    
    myModal.style.display = 'block'; // Mostrar modal
}


// Cerrar modal
close.onclick = function() {
    myModal.style.display = 'none';
};

// Marcar Pokémon como favorito
function markFavorite(name, button) {
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    if (!favorites.includes(name)) {
        favorites.push(name);
        localStorage.setItem('favorites', JSON.stringify(favorites));
        button.classList.add('favorited'); // Cambiar estilo del botón
    } else {
        const index = favorites.indexOf(name);
        favorites.splice(index, 1);
        localStorage.setItem('favorites', JSON.stringify(favorites));
        button.classList.remove('favorited'); // Cambiar estilo del botón
    }
}

// Buscar Pokémon
searchButton.addEventListener('click', () => {
    const searchTerm = searchInput.value.toLowerCase();
    filteredPokemons = allPokemons.filter(pokemon => 
        pokemon.name.toLowerCase().includes(searchTerm)
    );
    offset = 0; // Reiniciar la paginación al buscar
    displayPokemons(filteredPokemons.slice(offset, offset + limit));
});

// Botones de paginación
document.getElementById('prev-button').addEventListener('click', () => {
    if (offset > 0) {
        offset -= limit;
        displayPokemons(filteredPokemons.slice(offset, offset + limit));
    }
});

document.getElementById('next-button').addEventListener('click', () => {
    if (offset + limit < filteredPokemons.length) {
        offset += limit;
        displayPokemons(filteredPokemons.slice(offset, offset + limit));
    }
});

// Al cargar la página, se cargan los Pokémon iniciales
loadPokemons();
