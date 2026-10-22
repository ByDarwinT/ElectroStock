// Pokémon catalog: jQuery events, browser fetch, and Bootstrap modal.
// All Pokémon information comes from PokéAPI, never from PostgreSQL.
const API = 'https://pokeapi.co/api/v2';
const PAGE_SIZE = 24;
const grid = document.getElementById('pokemonGrid');
const statusText = document.getElementById('pokemonStatus');
const emptyText = document.getElementById('pokemonEmpty');
const moreButton = document.getElementById('pokemonMore');
const detailTitle = document.getElementById('productModalTitle');
const detailBody = document.getElementById('productModalBody');
const detailModal = new bootstrap.Modal(document.getElementById('productModal'));
const detailsCache = new Map();
const filterCache = new Map();
let index = [];
let filtered = [];
let typeNames = null;
let generationNames = null;
let visible = PAGE_SIZE;
let searchTimer;
let filterVersion = 0;
let modalVersion = 0;

// Fetch JSON and reject unsuccessful HTTP responses explicitly.
async function fetchJson(url) {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}: ${url}`);
    return response.json();
}

function readable(name) {
    return name.split('-').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
}
function idFromUrl(url) {
    return Number(url.match(/\/(\d+)\/?$/)?.[1]);
}
function artwork(id) {
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
}
function textNode(tag, value, className = '') {
    const node = document.createElement(tag);
    node.textContent = value;
    node.className = className;
    return node;
}
function detail(label, value) {
    const row = textNode('p', '', 'mb-2');
    row.append(textNode('strong', label + ': '), document.createTextNode(String(value)));
    detailBody.append(row);
}

// Render only one page of matching cards, so large results remain responsive.
function render() {
    grid.replaceChildren();
    filtered.slice(0, visible).forEach(item => {
        const col = textNode('div', '', 'col');
        const card = document.createElement('button');
        card.type = 'button';
        card.className = 'card h-100 w-100 text-center shadow-sm border-0';
        card.setAttribute('aria-label', `View ${readable(item.name)} details`);
        const body = textNode('div', '', 'card-body');
        const img = document.createElement('img');
        img.src = artwork(item.id);
        img.alt = readable(item.name);
        img.loading = 'lazy';
        img.className = 'img-fluid mb-2';
        img.style.cssText = 'height:140px;object-fit:contain';
        img.onerror = () => { img.hidden = true; };
        body.append(img, textNode('p', `#${String(item.id).padStart(4, '0')}`, 'text-secondary mb-1'),
            textNode('h2', readable(item.name), 'h5 fw-bold'));
        card.append(body);
        card.addEventListener('click', () => showDetails(item));
        col.append(card);
        grid.append(col);
    });
    emptyText.classList.toggle('d-none', filtered.length > 0);
    moreButton.classList.toggle('d-none', visible >= filtered.length);
    statusText.textContent = `${filtered.length} Pokémon found. Showing ${Math.min(visible, filtered.length)}.`;
}

// Fetch type and generation lists once; selected filters use the official resource membership.
async function loadFilterOptions() {
    try {
        const [types, generations] = await Promise.all([
            fetchJson(`${API}/type?limit=100`), fetchJson(`${API}/generation?limit=100`)
        ]);
        types.results.filter(t => !['unknown', 'shadow'].includes(t.name)).forEach(t =>
            $('#typeFilter').append(new Option(readable(t.name), t.name)));
        generations.results.forEach(g =>
            $('#generationFilter').append(new Option(readable(g.name), g.name)));
    } catch (error) {
        console.error('Cannot load filter options:', error);
        statusText.textContent = 'Filter options unavailable; you can still search by name.';
    }
}

async function memberNames(kind, value) {
    if (value === 'all') return null;
    const key = `${kind}:${value}`;
    if (!filterCache.has(key)) {
        const request = fetchJson(`${API}/${kind}/${encodeURIComponent(value)}/`)
            .then(data => new Set((kind === 'type' ? data.pokemon.map(item => item.pokemon.name)
                : data.pokemon_species.map(item => item.name))));
        filterCache.set(key, request);
        request.catch(() => filterCache.delete(key));
    }
    return filterCache.get(key);
}

// Combine name/ID, type and generation filters; ignore results from obsolete requests.
async function applyFilters() {
    const version = ++filterVersion;
    const query = $('#pokemonSearch').val().trim().toLowerCase();
    const selectedType = $('#typeFilter').val();
    const selectedGeneration = $('#generationFilter').val();
    statusText.textContent = 'Filtering Pokémon...';
    try {
        const [typeMembers, generationMembers] = await Promise.all([
            memberNames('type', selectedType), memberNames('generation', selectedGeneration)
        ]);
        if (version !== filterVersion) return;
        filtered = index.filter(p =>
            (p.name.includes(query) || String(p.id) === query || `#${p.id}` === query) &&
            (!typeMembers || typeMembers.has(p.name)) &&
            (!generationMembers || generationMembers.has(p.name))
        );
        visible = PAGE_SIZE;
        render();
    } catch (error) {
        if (version !== filterVersion) return;
        statusText.textContent = 'Could not apply filters. Please try again.';
        console.error('Filter request failed:', error);
    }
}

// Walk all evolution branches, including families with multiple possible evolutions.
function evolutionNames(chain) {
    if (!chain) return [];
    return [readable(chain.species.name), ...chain.evolves_to.flatMap(evolutionNames)];
}

// Chain APIs: /pokemon and /pokemon-species first, then the species evolution URL.
async function combinedDetails(id) {
    if (!detailsCache.has(id)) {
        const promise = Promise.all([
            fetchJson(`${API}/pokemon/${id}/`), fetchJson(`${API}/pokemon-species/${id}/`)
        ]).then(async ([pokemon, species]) => {
            const evolution = species.evolution_chain?.url
                ? await fetchJson(species.evolution_chain.url) : null;
            return {pokemon, species, evolution};
        });
        detailsCache.set(id, promise);
        promise.catch(() => detailsCache.delete(id));
    }
    return detailsCache.get(id);
}

// Open a modal immediately, then fill it once the external requests have completed.
async function showDetails(item) {
    const version = ++modalVersion;
    detailTitle.textContent = readable(item.name);
    detailBody.replaceChildren();
    detail('Status', 'Loading Pokémon details...');
    detailModal.show();
    try {
        const {pokemon, species, evolution} = await combinedDetails(item.id);
        if (version !== modalVersion) return;
        detailBody.replaceChildren();
        const image = document.createElement('img');
        image.src = pokemon.sprites.other?.['official-artwork']?.front_default || artwork(pokemon.id);
        image.alt = readable(item.name);
        image.className = 'img-fluid d-block mx-auto mb-3';
        image.style.cssText = 'height:170px;object-fit:contain';
        detailBody.append(image);
        detail('Pokédex ID', `#${pokemon.id}`);
        detail('Types', pokemon.types.map(x => readable(x.type.name)).join(', '));
        detail('Abilities', pokemon.abilities.map(x => readable(x.ability.name)).join(', '));
        detail('Height', `${pokemon.height / 10} m`);
        detail('Weight', `${pokemon.weight / 10} kg`);
        detail('Base stats', pokemon.stats.map(x => `${readable(x.stat.name)}: ${x.base_stat}`).join(' | '));
        const entry = species.flavor_text_entries.find(x => x.language.name === 'en');
        detail('Pokédex description', entry?.flavor_text.replace(/\s+/g, ' ').trim() || 'Not available');
        detail('Generation', readable(species.generation.name));
        detail('Evolution chain', evolutionNames(evolution?.chain).join(' → ') || 'Not available');
    } catch (error) {
        if (version !== modalVersion) return;
        detailBody.replaceChildren();
        detail('Error', 'Unable to load details. Please try again.');
        console.error('Pokémon detail request failed:', error);
    }
}

// jQuery handles the search input and selectors; the 4-second delay is a debounce.
$('#pokemonSearch').on('input', () => {
    clearTimeout(searchTimer);
    statusText.textContent = 'Searching 4 seconds after you stop typing...';
    searchTimer = setTimeout(applyFilters, 4000);
});
$('#typeFilter, #generationFilter').on('change', () => {
    clearTimeout(searchTimer);
    applyFilters();
});
$('#pokemonMore').on('click', () => { visible += PAGE_SIZE; render(); });

// Load only a lightweight Pokémon index; card details are fetched on demand.
(async function initializeCatalog() {
    statusText.textContent = 'Loading Pokémon from PokéAPI...';
    try {
        const data = await fetchJson(`${API}/pokemon?limit=2000&offset=0`);
        index = data.results.map(item => ({id: idFromUrl(item.url), name: item.name}))
            .filter(item => Number.isInteger(item.id));
        await applyFilters();
        await loadFilterOptions();
    } catch (error) {
        statusText.textContent = 'Cannot connect to PokéAPI. Check your connection.';
        console.error('Pokémon index request failed:', error);
    }
})();
