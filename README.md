# ElectroStock: Two-page catalog

Spring Boot / PostgreSQL REST backend remains unchanged. Frontend uses Bootstrap 5 and plain JavaScript.

## Pages
- `http://localhost:8080/`: Products from `/api/products` (PostgreSQL)
- `http://localhost:8080/pokemon.html`: Pokémon from PokéAPI

The **Products** and **Pokémon** links are ordinary HTML anchors, so navigation does not depend on JavaScript. Both pages show responsive cards (one column on mobile, two on tablets, three on desktops), a Bootstrap modal, and a search with a 4-second debounce. Only their own catalog JS file is loaded on each page.

## Run
Open the Maven project in NetBeans. Configure `src/main/resources/application.properties` to match your local PostgreSQL database. Execute `ElectroStockApplication.java` and open the URLs above.

If you see old content, stop the old application, use **Clean and Build**, then start again. Try Ctrl+F5 in the browser. Visit `/pokemon.html` directly to verify the new page exists.

## REST endpoints
GET/POST `/api/products`; GET/PUT/DELETE `/api/products/{id}`.

PokéAPI resource endpoints used by the frontend: `/api/v2/pokemon?limit=2000&offset=0`, `/api/v2/pokemon/{id}/`, and `/api/v2/pokemon-species/{id}/` on `https://pokeapi.co`.
