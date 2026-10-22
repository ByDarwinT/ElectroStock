# ElectroStock + PokéAPI

English-language educational Spring Boot web application with two independent responsive catalogs.

- **Products:** `http://localhost:8080/` — backed by PostgreSQL and REST CRUD at `/api/products`.
- **Pokémon:** `http://localhost:8080/pokemon.html` — uses PokéAPI, with type/generation filters, four-second debounced search, modal details and evolution chains.

Read `TECHNICAL_GUIDE.md` for detailed architecture, endpoints and setup. Read `PRESENTATION_OUTLINE.md` for the presentation agenda.

The frontend uses Bootstrap and jQuery from CDNs. JavaScript performs fetch requests and Promise-based API chaining. All application code and UI labels are in English.
