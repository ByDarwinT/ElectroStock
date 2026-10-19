// The catalog uses the existing Spring Boot REST API. No framework is required.
const productGrid = document.getElementById('productGrid');
const searchInput = document.getElementById('searchInput');
const searchStatus = document.getElementById('searchStatus');
const emptyMessage = document.getElementById('emptyMessage');
const modalTitle = document.getElementById('productModalTitle');
const modalBody = document.getElementById('productModalBody');
const productModal = new bootstrap.Modal(document.getElementById('productModal'));
const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
let products = [];
let searchTimer;

function element(tag, className, value) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (value !== undefined) node.textContent = value;
    return node;
}

function addDetail(label, value) {
    const row = element('div', 'mb-2');
    const strong = element('strong', '', label + ': ');
    row.append(strong, document.createTextNode(String(value ?? 'Not available')));
    modalBody.append(row);
}

function openDetails(product) {
    modalTitle.textContent = product.name;
    modalBody.replaceChildren();
    addDetail('Brand', product.brand);
    addDetail('Category', product.category);
    addDetail('Price', currency.format(Number(product.price)));
    addDetail('Quantity', product.quantity);
    addDetail('Description', product.description || 'No description available.');
    productModal.show();
}

function renderProducts(term = '') {
    const query = term.trim().toLocaleLowerCase('en');
    const matches = products.filter(product =>
        [product.name, product.brand, product.category].some(value =>
            String(value || '').toLocaleLowerCase('en').includes(query)
        )
    );

    productGrid.replaceChildren();
    matches.forEach(product => {
        const col = element('div', 'col');
        const card = element('button', 'card h-100 w-100 text-start border-0 shadow-sm p-0');
        card.type = 'button';
        card.setAttribute('aria-label', 'View details for ' + product.name);
        const body = element('div', 'card-body w-100');
        body.append(
            element('span', 'badge text-bg-light border mb-3', product.category),
            element('h2', 'card-title h5 fw-bold', product.name),
            element('p', 'card-text text-secondary mb-3', product.brand),
            element('p', 'fw-semibold text-primary fs-5 mb-0', currency.format(Number(product.price)))
        );
        card.append(body);
        card.addEventListener('click', () => openDetails(product));
        col.append(card);
        productGrid.append(col);
    });
    emptyMessage.classList.toggle('d-none', matches.length !== 0);
    searchStatus.textContent = `${matches.length} product(s) found.`;
}

searchInput.addEventListener('input', () => {
    clearTimeout(searchTimer);
    searchStatus.textContent = 'Searching 4 seconds after you stop typing...';
    searchTimer = setTimeout(() => renderProducts(searchInput.value), 4000);
});

async function loadProducts() {
    try {
        const response = await fetch('/api/products');
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        products = await response.json();
        renderProducts(searchInput.value);
    } catch (error) {
        productGrid.replaceChildren();
        searchStatus.textContent = 'Could not load products. Check that Spring Boot and PostgreSQL are running.';
        console.error('Failed to load products:', error);
    }
}

loadProducts();
