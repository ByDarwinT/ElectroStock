# ElectroStock / PokéAPI – Technical Guide

## Purpose and scope

ElectroStock is an educational web application showing **two independent data sources** in a shared responsive catalog design. The Products page consumes a Spring Boot REST API backed by PostgreSQL, whereas the Pokémon page consumes PokéAPI directly in the browser. The product backend still exposes full CRUD, but this catalog UI is intentionally read-only.

## Technology inventory

- Java 17, Spring Boot 4.0.1 and Spring MVC: REST endpoints.
- Spring Data JPA and Hibernate: Java-to-PostgreSQL mapping and CRUD persistence.
- PostgreSQL: product data storage.
- Maven: dependency and build management.
- HTML5, Bootstrap 5.3.3: layout, cards, responsive columns and modals.
- JavaScript (ES2017+): fetch, promises, DOM creation, async/await, caching.
- jQuery 3.7.1: `input`, `change` and `click` event registration.
- Debounce: a technique implemented using `clearTimeout` and `setTimeout(..., 4000)`; **not a separate installed library**.

## Architectural behavior

Products: Browser → `GET /api/products` → ProductController → ProductService → ProductRepository → PostgreSQL → JSON → browser card grid.

Pokémon: Browser → PokéAPI `/pokemon?limit=2000&offset=0` for lightweight list → browser card grid. Clicking a card requests `/pokemon/{id}` and `/pokemon-species/{id}` concurrently; the species result supplies `evolution_chain.url`, fetched afterward. The combined result populates the Bootstrap modal. Pokémon data are not persisted.

Patterns: layered architecture (Controller, Service, Repository), MVC-style separation of concerns (without server-rendered views), Repository, dependency injection, RESTful resource APIs, event-driven frontend, promise-based asynchronous programming.

Paradigms: Java object-oriented programming, declarative JPA annotations, functional array processing (`map`, `filter`, `flatMap`), event-driven UI and asynchronous programming (`async`, `await`, `Promise.all`).

## Own REST endpoints

| HTTP | Path | Behavior |
|---|---|---|
| GET | `/api/products` | All products |
| GET | `/api/products/{id}` | One product (404 if absent) |
| POST | `/api/products` | Create using JSON (201) |
| PUT | `/api/products/{id}` | Update using JSON |
| DELETE | `/api/products/{id}` | Delete (204) |

Example JSON: `{"name":"Smart TV","brand":"Samsung","category":"Televisions","price":499.99,"quantity":8,"description":"Smart television."}`

## PokéAPI endpoints

| Path | Use |
|---|---|
| `/pokemon?limit=2000&offset=0` | Pokémon name and URL index |
| `/pokemon/{id}` | Abilities, artwork, types, size and stats |
| `/pokemon-species/{id}` | English Pokédex flavor text, generation and evolution chain URL |
| `/evolution-chain/{id}` | Evolution tree |
| `/type?limit=100` | Filter select options |
| `/type/{name}` | Pokémon membership of selected type |
| `/generation?limit=100` | Generation select options |
| `/generation/{name}` | Species introduced in a generation |

A name/ID search is combined with selected type and generation through intersection in JavaScript. The results are paginated **on screen** 24 cards at a time. The index is limited to the first 2000 items from the API, so it does not guarantee including future Pokémon entries. Some alternate forms can differ between `/pokemon` and `/generation` species membership; the generation filter is most accurate for the standard species names.

## Fetch, promises and sequence

`fetch(url)` returns a **Promise** of an HTTP `Response`. `response.ok` must be checked because HTTP 404 or 500 does not automatically reject `fetch`. `response.json()` returns a **second Promise** that resolves to a JavaScript object. An `async` function returns a Promise; `await` pauses that function until it settles without blocking the entire browser UI.

`Promise.all([fetchJson(pokemonUrl), fetchJson(speciesUrl)])` requests two independent endpoints concurrently. Next, `species.evolution_chain.url` is available and the code requests its data. This is API chaining, not an SQL JOIN.

`detailsCache` stores promises by Pokémon ID to avoid repeated API calls. `filterCache` stores type/generation membership. Version counters prevent outdated results from replacing a newer selection.

## Responsive UI and debounce

Bootstrap `.row-cols-1 .row-cols-md-2 .row-cols-lg-3` produces 1 column on mobile, 2 from the medium breakpoint and 3 from the large breakpoint. Bootstrap modal shows accessible dialog structure. jQuery `.on('input')` observes typing. Each input clears the old timeout and schedules `applyFilters()` after 4000 ms; changing filter selects runs immediately. Filter requests may still be asynchronous.

## How to run

1. Create database `electrostock` on local PostgreSQL.
2. Set `DB_PASSWORD`, `DB_USER`, `DB_URL` in the environment or configure a local, uncommitted `application.properties` (do not commit credentials).
3. Open the Maven project in NetBeans and run `ElectroStockApplication`.
4. Navigate to `http://localhost:8080/` for Products or `http://localhost:8080/pokemon.html` for Pokémon.
5. Internet access is needed for CDN-hosted Bootstrap/jQuery and PokéAPI.

## Known limitations

- Catalog UI is read-only; use Postman/curl for product creation, update and delete.
- Server must have PostgreSQL. Pokémon tab additionally depends on a network connection and PokéAPI availability.
- Image URLs may occasionally be unavailable and are hidden on load failures.
- Filtering is applied to API-backed membership sets and name/ID index, not to every detailed record.
- Bootstrap and jQuery are loaded via public CDNs.

## Suggested defense questions

1. Why is ProductRepository short? Spring Data JPA generates common persistence operations.
2. Why isn't Pokémon stored in PostgreSQL? This tab consumes read-only external REST resources directly.
3. What does `Promise.all` accomplish? Runs independent requests in parallel.
4. Why does the evolution request happen later? Its URL comes from the species response.
5. What happens when the user types quickly? Debounce cancels the pending timer and searches four seconds after the latest input.
6. Is jQuery necessary for debounce? No; here it is used for event binding, while native timers implement debounce.
7. Why do cards reflow on mobile? Bootstrap breakpoint classes handle the columns.
