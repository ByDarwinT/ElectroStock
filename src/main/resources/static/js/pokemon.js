// PokéAPI is public and read-only. Pokémon are never saved to PostgreSQL.
const modalTitle = document.getElementById('productModalTitle');
const modalBody = document.getElementById('productModalBody');
const productModal = new bootstrap.Modal(document.getElementById('productModal'));
const pokemonSearch = document.getElementById('pokemonSearch');
const pokemonStatus = document.getElementById('pokemonStatus');
const pokemonGrid = document.getElementById('pokemonGrid');
const pokemonEmpty = document.getElementById('pokemonEmpty');
const pokemonMore = document.getElementById('pokemonMore');
const pokemonDetailsCache = new Map();
const POKEAPI = 'https://pokeapi.co/api/v2';
const PAGE_SIZE = 24;
let pokemonIndex = [];
let pokemonMatches = [];
let visibleCount = PAGE_SIZE;
let pokemonSearchTimer;
let pokemonLoadingPromise;

function pokemonIdFromUrl(url) {
    return Number(url.match(/\/pokemon\/(\d+)\/?$/)?.[1]);
}

function pokemonArtwork(id) {
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
}

function prettyName(name) {
    return name.split('-').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
}

function renderPokemon() {
    pokemonGrid.replaceChildren();
    pokemonMatches.slice(0, visibleCount).forEach(pokemon => {
        const col = document.createElement('div');
        col.className = 'col';
        const card = document.createElement('button');
        card.type = 'button';
        card.className = 'card h-100 w-100 text-start shadow-sm border-0';
        card.setAttribute('aria-label', `View ${prettyName(pokemon.name)} details`);
        const body = document.createElement('div');
        body.className = 'card-body w-100 text-center';
        const img = document.createElement('img');
        img.src = pokemonArtwork(pokemon.id);
        img.alt = prettyName(pokemon.name);
        img.loading = 'lazy';
        img.className = 'img-fluid mb-2';
        img.style.cssText = 'height:140px;max-width:100%;object-fit:contain';
        img.onerror = () => { img.hidden = true; };
        const number = document.createElement('p');
        number.className = 'text-secondary mb-1';
        number.textContent = `#${String(pokemon.id).padStart(4, '0')}`;
        const name = document.createElement('h2');
        name.className = 'h5 fw-bold mb-0';
        name.textContent = prettyName(pokemon.name);
        body.append(img, number, name);
        card.append(body);
        card.addEventListener('click', () => openPokemonDetails(pokemon));
        col.append(card);
        pokemonGrid.append(col);
    });
    pokemonEmpty.classList.toggle('d-none', pokemonMatches.length > 0);
    pokemonMore.classList.toggle('d-none', visibleCount >= pokemonMatches.length);
    pokemonStatus.textContent = `${pokemonMatches.length} Pokémon found. Showing ${Math.min(visibleCount, pokemonMatches.length)}.`;
}

function searchPokemon() {
    const query = pokemonSearch.value.trim().toLowerCase();
    pokemonMatches = pokemonIndex.filter(pokemon =>
        pokemon.name.includes(query) || String(pokemon.id) === query || `#${pokemon.id}` === query
    );
    visibleCount = PAGE_SIZE;
    renderPokemon();
}

async function loadPokemonIndex() {
    pokemonStatus.textContent = 'Loading Pokémon from PokéAPI...';
    try {
        // Index fetch: lightweight names and URLs; detailed requests happen only on card clicks.
        const response = await fetch(`${POKEAPI}/pokemon?limit=2000&offset=0`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        pokemonIndex = data.results.map(item => ({
            name: item.name,
            id: pokemonIdFromUrl(item.url)
        })).filter(item => Number.isInteger(item.id));
        // Session cache reduces repeat requests on navigation/reload.
        searchPokemon();
    } catch (error) {
        pokemonStatus.textContent = 'Unable to reach PokéAPI. Check your internet connection and try again.';
        console.error('PokéAPI load failed:', error);
        pokemonLoadingPromise = null;
    }
}

function appendPokemonDetail(container, label, value) {
    const row = document.createElement('p');
    row.className = 'mb-2';
    const bold = document.createElement('strong');
    bold.textContent = `${label}: `;
    row.append(bold, document.createTextNode(String(value)));
    container.append(row);
}

async function getPokemonDetails(id) {
    if (pokemonDetailsCache.has(id)) return pokemonDetailsCache.get(id);
    const [pokemonResponse, speciesResponse] = await Promise.all([
        fetch(`${POKEAPI}/pokemon/${id}/`),
        fetch(`${POKEAPI}/pokemon-species/${id}/`)
    ]);
    if (!pokemonResponse.ok || !speciesResponse.ok) throw new Error('Details unavailable');
    const info = await Promise.all([pokemonResponse.json(), speciesResponse.json()]);
    pokemonDetailsCache.set(id, info);
    return info;
}

async function openPokemonDetails(pokemon) {
    // Reuse the same Bootstrap modal used for products.
    modalTitle.textContent = prettyName(pokemon.name);
    modalBody.replaceChildren();
    appendPokemonDetail(modalBody, 'Status', 'Loading details...');
    productModal.show();
    try {
        const [details, species] = await getPokemonDetails(pokemon.id);
        // Ignore a stale result if the user has opened another card.
        if (modalTitle.textContent !== prettyName(pokemon.name)) return;
        modalBody.replaceChildren();
        const image = document.createElement('img');
        image.src = details.sprites.other?.['official-artwork']?.front_default || details.sprites.front_default || pokemonArtwork(pokemon.id);
        image.alt = prettyName(pokemon.name);
        image.className = 'img-fluid d-block mx-auto mb-3';
        image.style.cssText = 'height:170px;object-fit:contain';
        modalBody.append(image);
        appendPokemonDetail(modalBody, 'Pokédex number', `#${pokemon.id}`);
        appendPokemonDetail(modalBody, 'Types', details.types.map(entry => prettyName(entry.type.name)).join(', '));
        appendPokemonDetail(modalBody, 'Abilities', details.abilities.map(entry => prettyName(entry.ability.name)).join(', '));
        appendPokemonDetail(modalBody, 'Height', `${details.height / 10} m`);
        appendPokemonDetail(modalBody, 'Weight', `${details.weight / 10} kg`);
        appendPokemonDetail(modalBody, 'Base experience', details.base_experience ?? 'Not available');
        appendPokemonDetail(modalBody, 'Base stats', details.stats.map(entry => `${prettyName(entry.stat.name)}: ${entry.base_stat}`).join(' | '));
        const description = species.flavor_text_entries.find(entry => entry.language.name === 'en')?.flavor_text
            ?.replace(/\s+/g, ' ').trim() || 'No English Pokédex description available.';
        appendPokemonDetail(modalBody, 'Pokédex description', description);
    } catch (error) {
        if (modalTitle.textContent !== prettyName(pokemon.name)) return;
        modalBody.replaceChildren();
        appendPokemonDetail(modalBody, 'Error', 'Could not retrieve Pokémon details. Try again later.');
        console.error('PokéAPI detail failed:', error);
    }
}

pokemonSearch.addEventListener('input', () => {
    clearTimeout(pokemonSearchTimer);
    pokemonStatus.textContent = 'Searching 4 seconds after you stop typing...';
    pokemonSearchTimer = setTimeout(searchPokemon, 4000);
});
pokemonMore.addEventListener('click', () => {
    visibleCount += PAGE_SIZE;
    renderPokemon();
});
pokemonLoadingPromise = loadPokemonIndex();
