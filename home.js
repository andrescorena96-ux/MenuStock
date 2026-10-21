/* ============================================================
   1. DOM REFERENCES
   Everything the script touches is grabbed here FIRST, so no
   function that runs during initialization can hit a variable
   that hasn't been declared yet (this was the bug you had:
   initializeProfiles() ran before profileButtonName existed).
   ============================================================ */

// Products / search
const allProducts = document.getElementById("productList");
const filterCat = document.getElementById("searchBy");
const searchInp = document.getElementById("invSearch");
const filterByName = document.getElementById("filterByName");
const filterByMinPrice = document.getElementById("filterByMinPrice");
const filterByMaxPrice = document.getElementById("filterByMaxPrice");
const filterByStock = document.getElementById("filterByStock");

// Views (products / categories)
const searchPan = document.getElementById("searchPan");
const productsTitle = document.getElementById("productsTitle");
const actionsBar = document.getElementById("actionsBar");
const breadcrumb = document.getElementById("breadcrumb");
const categoriesView = document.getElementById("categoriesView");
const categoryTree = document.getElementById("categoryTree");
const productsBt = document.getElementById("productsBt");
const categoriesBt = document.getElementById("categoriesBt");
const newCategoryBt = document.getElementById("newCategoryBt");
const historyBt = document.getElementById("historyBt");

// Welcome / landing (Creatussiness)
const appRoot = document.getElementById("appRoot");
const welcomeSection = document.getElementById("welcomeSection");
const welcomeGetStartedBt = document.getElementById("welcomeGetStartedBt");
const welcomeLearnBt = document.getElementById("welcomeLearnBt");
const welcomeOriginBt = document.getElementById("welcomeOriginBt");
const welcomeMakeItYoursBt = document.getElementById("welcomeMakeItYoursBt");
const welcomeFinalCtaBt = document.getElementById("welcomeFinalCtaBt");
const aboutSection = document.getElementById("aboutSection");
const originSection = document.getElementById("originSection");
const backToWelcomeBt = document.getElementById("backToWelcomeBt");

// Profile selection screen
const profileSection = document.getElementById("profileSection");
const profileCards = document.querySelectorAll(".profileCard");
const createProfileBt = document.getElementById("createProfileBt");

// Password gate (login de un perfil protegido)
const passwordGate = document.getElementById("passwordGate");
const passwordGateAvatar = document.getElementById("passwordGateAvatar");
const passwordGateName = document.getElementById("passwordGateName");
const passwordGateInput = document.getElementById("passwordGateInput");
const passwordGateError = document.getElementById("passwordGateError");
const passwordGateSubmitBt = document.getElementById("passwordGateSubmitBt");
const passwordGateBackBt = document.getElementById("passwordGateBackBt");

// Profile menu (topbar)
const profileButton = document.getElementById("profileButton");
const profileMenu = document.getElementById("profileMenu");
const profileButtonName = document.getElementById("profileButtonName");
const profileButtonAvatar = document.getElementById("profileButtonAvatar");
const profileMenuName = document.getElementById("profileMenuName");
const profileMenuAvatar = document.getElementById("profileMenuAvatar");
const changeProfileBt = document.getElementById("changeProfileBt");
const renameProfileBt = document.getElementById("renameProfileBt");
const closeProfileMenuBt = document.getElementById("closeProfileMenuBt");

// Action modal (add product / restock)
const overlay = document.getElementById("actionPan");
const modali = document.getElementById("modali");
const modalcont = document.getElementById("modali-content");
const restock = document.getElementById("restock");
const addProduct = document.getElementById("addProduct");

// Accumulate panel (bill / change price / delete)
const accumulatePanel = document.getElementById("accumulatePanel");
const accModalContent = document.getElementById("accModalContent");
const changePrice = document.getElementById("changePrice");
const deleteProduct = document.getElementById("delProduct");
const accCancelBt = document.getElementById("accumulateCancelBt");
const accConfirmBt = document.getElementById("accumulateConfirmBt");
const alternativeCont = document.getElementById("alternativeCont");


/* ============================================================
   2. STATE VARIABLES
   ============================================================ */

let products = [];
let historial = [];
let restockPreferences = {};
let currentUser = null;

// NUEVO
let stockHistory = [];   // movimientos de inventario
let categories = [];     // [{ id, name, subcategories: [{ id, name }] }]
let clothingConfig = null; // { sizeSystem, sizeList } — solo si storeType === "clothing"

let currentCategoryId = null;      // null = todos los productos
let currentSubcategoryId = null;

let bill = 0;
let myList = [];
let act = "bill";

const USERS_KEY = "inventoryUsers";
const CURRENT_USER_KEY = "currentInventoryUser";
const WELCOME_SEEN_KEY = "creatussinessWelcomeSeen";

// Tipos de negocio disponibles al crear un perfil.
// "other" usa la misma configuración general que "general" por ahora.
const STORE_TYPES = [
    { id: "general",  icon: "🏬", label: "Tienda General / Productos Generales" },
    { id: "clothing", icon: "👕", label: "Tienda de Ropa" },
    { id: "other",    icon: "✨", label: "Otro" }
];

// Sistemas de tallas disponibles al configurar una Tienda de Ropa.
// "defaultSizes" solo aplica a "letter" (tallas fijas); los demás
// sistemas piden que el usuario escriba su propia lista.
const SIZE_SYSTEMS = [
    { id: "letter",  icon: "🔤", label: "Tallas de letra", defaultSizes: ["XS", "S", "M", "L", "XL", "XXL"] },
    { id: "numeric", icon: "🔢", label: "Tallas numéricas", defaultSizes: null },
    { id: "shoe",    icon: "👟", label: "Tallas de calzado", defaultSizes: null },
    { id: "custom",  icon: "🧩", label: "Tallas personalizadas", defaultSizes: null }
];

// Formas de manejar la cantidad de un producto de ropa al crearlo.
const VARIANT_MODES = [
    { id: "unique",    icon: "🔘", label: "Artículo único" },
    { id: "sameAll",   icon: "📏", label: "Misma cantidad por talla" },
    { id: "perSize",   icon: "🔢", label: "Cantidad distinta por talla" },
    { id: "colorSize", icon: "🎨", label: "Colores y tallas" }
];

// Estado temporal mientras se crea un perfil nuevo:
// tipo de negocio elegido, y su configuración de ropa si aplica.
let selectedStoreType = null;
let selectedSizeSystem = null;
let pendingClothingConfig = null;

// Perfil que está esperando su contraseña en el password gate.
let pendingLoginUserId = null;

function storeTypeInfo(storeTypeId) {
    return STORE_TYPES.find(type => type.id === storeTypeId) || STORE_TYPES[STORE_TYPES.length - 1];
}

// Máximo de movimientos guardados por perfil (evita que localStorage crezca sin límite)
const MAX_HISTORY = 1000;

// Opciones de empaque del Restock. "none" = sin conversión, unidades directas.
const PACK_OPTIONS = [
    { value: "1", label: "Unidad (x1)" },
    { value: "6", label: "Sixpack (x6)" },
    { value: "12", label: "Caja (x12)" },
    { value: "24", label: "Caja (x24)" },
    { value: "none", label: "Ninguno (unidades directas)" }
];

const ACTION_LABELS = {
    created: "Producto creado",
    restock: "Restock",
    adjustment: "Ajuste manual",
    sale: "Venta",
    deleted: "Producto eliminado"
};


/* ============================================================
   3. LOCALSTORAGE / USER PERSISTENCE
   ============================================================ */

// ----------------------------------------
// GET ALL USERS
// ----------------------------------------
function getUsers() {
    const savedUsers = localStorage.getItem(USERS_KEY);
    if (!savedUsers) {
        return [];
    }
    return JSON.parse(savedUsers);
}

// ----------------------------------------
// SAVE ALL USERS
// ----------------------------------------
function saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

// ----------------------------------------
// SAVE CURRENT USER
// ----------------------------------------
function saveCurrentUser() {
    if (!currentUser) return;

    // Actualizamos el perfil con los datos
    // que está usando actualmente la aplicación
    currentUser.products = products;
    currentUser.restockPreferences = restockPreferences;
    currentUser.historial = historial;

    // NUEVO
    currentUser.stockHistory = stockHistory;
    currentUser.categories = categories;
    currentUser.clothingConfig = clothingConfig;

    const users = getUsers();
    const index = users.findIndex(user => user.id === currentUser.id);

    if (index === -1) {
        console.error("No se encontró el perfil actual.");
        return;
    }

    // Reemplazamos la versión vieja por la versión actualizada
    users[index] = currentUser;
    saveUsers(users);
}

// ----------------------------------------
// CREATE DEFAULT USERS
// ----------------------------------------
function createDefaultUsers() {
    const users = getUsers();

    // Si ya existen perfiles, no hacemos nada
    if (users.length > 0) {
        return;
    }

    const defaultUsers = [
        {
            id: crypto.randomUUID(),
            profile: { name: "Juan" },
            password: null,
            storeType: "general",
            clothingConfig: null,
            products: [],
            restockPreferences: {},
            historial: [],
            stockHistory: [],
            categories: []
        },
        {
            id: crypto.randomUUID(),
            profile: { name: "Maria" },
            password: null,
            storeType: "general",
            clothingConfig: null,
            products: [],
            restockPreferences: {},
            historial: [],
            stockHistory: [],
            categories: []
        }
    ];

    saveUsers(defaultUsers);
}


/* ============================================================
   3b. HISTORIAL DE STOCK
   Cada cambio de inventario deja un registro. NO inventamos
   registros para el stock que ya existía: el historial empieza
   a contar desde ahora.
   ============================================================ */

function recordStockChange(product, action, change, unitLabel) {
    if (!product) return;

    stockHistory.push({
        id: crypto.randomUUID(),
        productId: product.id,
        productName: product.name,
        date: new Date().toISOString(),
        action: action,                    // created | restock | adjustment | sale | deleted
        change: change,                    // +28 / -3 ...
        resultingStock: product.quantity,  // stock después del cambio
        unit: unitLabel || null            // "Sixpack (x6) · 2 + 16" por ejemplo
    });

    if (stockHistory.length > MAX_HISTORY) {
        stockHistory.splice(0, stockHistory.length - MAX_HISTORY);
    }
}

function formatHistoryDate(isoString) {
    const date = new Date(isoString);
    if (Number.isNaN(date.getTime())) return "";

    return date.toLocaleString("es-CO", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
}


/* ============================================================
   3c. EXPRESIONES DE RESTOCK
   El usuario puede escribir "2 + 16", "-3", "10 - 2".

   Regla de conversión:
     - El PRIMER número usa el empaque seleccionado.
       Sixpack + "2 + 16"  ->  2 x 6 = 12, más 16 unidades sueltas = 28
     - Los demás números son unidades sueltas.
     - Con "Ninguno" no hay conversión: todo son unidades directas,
       así que "-3" resta 3 unidades.

   Se valida con una expresión regular y se suman los términos a
   mano: nunca se ejecuta el texto del usuario como JavaScript.
   ============================================================ */

function parseRestockExpression(text, packValue) {
    const clean = String(text ?? "").replace(/\s+/g, "");

    if (clean === "") {
        return { ok: true, empty: true, units: 0, terms: [] };
    }

    // Solo números enteros o decimales separados por + y -
    const shape = /^[+-]?\d+(?:\.\d+)?(?:[+-]\d+(?:\.\d+)?)*$/;
    if (!shape.test(clean)) {
        return { ok: false, empty: false, units: 0, terms: [] };
    }

    const terms = clean.match(/[+-]?\d+(?:\.\d+)?/g).map(Number);
    const packSize = packValue === "none" ? 1 : Number(packValue) || 1;

    let units = 0;
    terms.forEach((term, index) => {
        units += index === 0 ? term * packSize : term;
    });

    return {
        ok: true,
        empty: false,
        units: Math.round(units),
        terms: terms,
        packSize: packSize
    };
}

function packLabel(packValue) {
    const option = PACK_OPTIONS.find(opt => opt.value === String(packValue));
    return option ? option.label : `x${packValue}`;
}


/* ============================================================
   3d. AYUDANTES DEL PANEL DE RESTOCK
   Viven fuera de myInventaryActions() y sus listeners se
   registran UNA sola vez sobre #modali-content: si se
   registraran al abrir el modal, se irían acumulando en cada
   apertura y el Enter saltaría varios campos a la vez.
   ============================================================ */

// Vista previa del cálculo, en vivo
function updatePreview(productId) {
    const packSelect = document.getElementById(`pack-${productId}`);
    const qtyInput = document.getElementById(`inputRestock-${productId}`);
    const preview = document.getElementById(`preview-${productId}`);
    if (!packSelect || !qtyInput || !preview) return;

    const parsed = parseRestockExpression(qtyInput.value, packSelect.value);

    preview.classList.remove("positive", "negative", "invalid");

    if (parsed.empty) {
        preview.textContent = "= 0 u.";
        return;
    }

    if (!parsed.ok) {
        preview.textContent = "no válido";
        preview.classList.add("invalid");
        return;
    }

    preview.textContent = `= ${parsed.units > 0 ? "+" : ""}${parsed.units} u.`;
    preview.classList.add(parsed.units < 0 ? "negative" : "positive");
}

function getDisplayedRestockItems() {
    return [...document.querySelectorAll(".restockItem")]
        .filter(item => item.style.display !== "none");
}

function handleRestockLiveUpdate(event) {
    const item = event.target.closest(".restockItem");
    if (item) updatePreview(item.dataset.id);
}

function handleRestockKeydown(event) {
    if (event.key !== "Enter") return;

    const target = event.target;

    // ENTER SOBRE EL SELECT DE EMPAQUE
    if (target.matches(".restockItem select")) {
        event.preventDefault();

        const item = target.closest(".restockItem");
        const input = item.querySelector("input");

        if (input) {
            input.focus();
            input.select();
        }
        return;
    }

    // ENTER SOBRE LA CANTIDAD
    if (target.matches(".restockItem input")) {
        event.preventDefault();

        const visibleItems = getDisplayedRestockItems();
        const currentItem = target.closest(".restockItem");
        const currentIndex = visibleItems.indexOf(currentItem);
        const nextItem = visibleItems[currentIndex + 1];

        if (nextItem) {
            const nextInput = nextItem.querySelector("input");
            if (nextInput) {
                nextInput.focus();
                nextInput.select();
            }
            return;
        }

        // Último producto visible → volvemos al buscador
        const restockFilter = document.getElementById("restockFilter");
        if (restockFilter) restockFilter.focus();
    }
}

modalcont.addEventListener("input", handleRestockLiveUpdate);
modalcont.addEventListener("change", handleRestockLiveUpdate);
modalcont.addEventListener("keydown", handleRestockKeydown);


/* ============================================================
   3e. WELCOME / LANDING (Creatussiness)
   Vista independiente montada delante de #appRoot. No decide
   nada sobre perfiles: solo se interpone antes de que el
   usuario los vea, la primera vez que abre la app.
   ============================================================ */

function showWelcomeOnly() {
    welcomeSection.classList.remove("hidden");
    appRoot.classList.add("hidden");
}

function enterApp() {
    localStorage.setItem(WELCOME_SEEN_KEY, "true");
    welcomeSection.classList.add("hidden");
    appRoot.classList.remove("hidden");
}


/* ============================================================
   4. PROFILE SELECTION SCREEN
   ============================================================ */

// ----------------------------------------
// DISPLAY PROFILES
// ----------------------------------------
function displayProfiles() {
    const profileList = document.getElementById("profileList");
    const users = getUsers();

    profileList.innerHTML = "";

    users.forEach(user => {
        const card = document.createElement("div");
        card.classList.add("profileCard");
        card.dataset.profileId = user.id;

        const firstLetter = user.profile.name.charAt(0).toUpperCase();
        const type = storeTypeInfo(user.storeType);
        const lockIcon = user.password ? " 🔒" : "";

        card.innerHTML = `
            <div class="profileAvatar">
                ${firstLetter}
            </div>
            <div class="profileInfo">
                <h3>${user.profile.name}${lockIcon}</h3>
                <span>${type.icon} ${type.label}</span>
            </div>
            <button class="profileSelect">
                Entrar
            </button>
        `;

        profileList.appendChild(card);
    });
}

// ----------------------------------------
// SELECT PROFILE
// ----------------------------------------
function selectProfile(userId) {
    const users = getUsers();
    const user = users.find(user => user.id === userId);

    if (!user) {
        console.error("Perfil no encontrado");
        return;
    }

    currentUser = user;

    // Guardamos cuál fue el último perfil usado
    localStorage.setItem(CURRENT_USER_KEY, user.id);

    // Conectamos los datos del perfil
    products = currentUser.products;
    restockPreferences = currentUser.restockPreferences;
    historial = currentUser.historial;

    // COMPATIBILIDAD: perfiles creados antes de esta versión
    // no tienen historial de stock ni categorías.
    if (!Array.isArray(currentUser.stockHistory)) {
        currentUser.stockHistory = [];
    }
    if (!Array.isArray(currentUser.categories)) {
        currentUser.categories = [];
    }
    // Perfiles creados antes de Creatussiness no tienen tipo de negocio.
    // Cualquier valor que no sea uno de los 3 tipos actuales
    // (versiones anteriores de esta app llegaron a usar "drinks",
    // "food", "bakery", "beauty") cae en "general", que es la misma
    // configuración de inventario que ya tenían.
    if (!STORE_TYPES.some(type => type.id === currentUser.storeType)) {
        currentUser.storeType = "general";
    }
    if (!("clothingConfig" in currentUser)) {
        currentUser.clothingConfig = null;
    }

    stockHistory = currentUser.stockHistory;
    categories = currentUser.categories;
    clothingConfig = currentUser.clothingConfig;

    // Los productos viejos simplemente quedan sin categoría.
    for (let product of products) {
        if (!("category" in product)) product.category = null;
        if (!("subcategory" in product)) product.subcategory = null;
    }

    console.log("Perfil seleccionado:", currentUser.profile.name);

    hideProfiles();

    // Cada perfil entra viendo todos sus productos
    currentCategoryId = null;
    currentSubcategoryId = null;
    showProductsView();

    updateProfileUI();
}

// ----------------------------------------
// CREAR PERFIL: paso final (nombre + contraseña)
// Se llama después de elegir tipo de negocio (y tallas, si es
// una tienda de ropa). Si el usuario cancela en cualquier punto
// de esta parte, simplemente no se crea el perfil.
// ----------------------------------------
function finishProfileCreation() {
    const name = prompt("Nombre del nuevo perfil:");
    if (!name) {
        resetPendingProfileState();
        return;
    }

    const cleanName = name.trim();
    if (!cleanName) {
        resetPendingProfileState();
        return;
    }

    const users = getUsers();
    const alreadyExists = users.some(
        user => user.profile.name.toLowerCase() === cleanName.toLowerCase()
    );

    if (alreadyExists) {
        alert("Ya existe un perfil con ese nombre.");
        resetPendingProfileState();
        return;
    }

    const password = prompt(`Crea una contraseña para "${cleanName}" (protegerá este perfil):`);
    const cleanPassword = (password || "").trim();

    if (!cleanPassword) {
        alert("Necesitas una contraseña para proteger este perfil. No se creó el perfil.");
        resetPendingProfileState();
        return;
    }

    const newUser = {
        id: crypto.randomUUID(),
        profile: { name: cleanName },
        password: cleanPassword,
        storeType: selectedStoreType,
        clothingConfig: selectedStoreType === "clothing" ? pendingClothingConfig : null,
        // NUEVO PERFIL = INVENTARIO VACÍO (con categorías sugeridas si es ropa)
        products: [],
        restockPreferences: {},
        historial: [],
        stockHistory: [],
        categories: selectedStoreType === "clothing" ? buildDefaultClothingCategories() : []
    };

    users.push(newUser);
    saveUsers(users);
    displayProfiles();

    resetPendingProfileState();
    act = "bill";

    selectProfile(newUser.id);
}

function resetPendingProfileState() {
    selectedStoreType = null;
    selectedSizeSystem = null;
    pendingClothingConfig = null;
}

// ----------------------------------------
// CATEGORÍAS SUGERIDAS PARA UNA TIENDA DE ROPA NUEVA
// El usuario puede renombrarlas, borrarlas o agregar las suyas
// después; esto solo ahorra el punto de partida.
// ----------------------------------------
function buildDefaultClothingCategories() {
    const buildSubcats = names => names.map(name => ({ id: crypto.randomUUID(), name }));

    return [
        {
            id: crypto.randomUUID(),
            name: "Hombre",
            subcategories: buildSubcats(["Camisas", "Chaquetas", "Pantalones", "Zapatos"])
        },
        {
            id: crypto.randomUUID(),
            name: "Mujer",
            subcategories: buildSubcats(["Camisas", "Vestidos", "Pantalones", "Zapatos"])
        }
    ];
}

// ----------------------------------------
// SHOW / HIDE PROFILE SCREEN
// ----------------------------------------
function showProfiles() {
    hidePasswordGate();
    displayProfiles();
    document.getElementById("profileSection").classList.remove("hidden");
}

function hideProfiles() {
    document.getElementById("profileSection").classList.add("hidden");
}

// ----------------------------------------
// INITIALIZE PROFILES
// ----------------------------------------
function initializeProfiles() {
    createDefaultUsers();

    const users = getUsers();
    const lastUserId = localStorage.getItem(CURRENT_USER_KEY);

    // Si existe un perfil usado anteriormente, lo cargamos automáticamente...
    if (lastUserId) {
        const user = users.find(user => user.id === lastUserId);
        if (user) {
            // ...a menos que ese perfil tenga contraseña: en ese caso
            // "protegido" tiene que significar algo también al recargar.
            if (user.password) {
                showPasswordGate(user);
                return;
            }
            selectProfile(user.id);
            return;
        }
    }

    // Si no hay perfil seleccionado, mostramos la pantalla de perfiles
    showProfiles();
}


/* ============================================================
   4b. PASSWORD GATE
   Pantalla intermedia entre "elegir perfil" y "entrar al
   inventario", para perfiles que tienen contraseña. Perfiles
   sin contraseña (todos los que ya existían antes de esto)
   siguen entrando directo, sin ningún cambio de comportamiento.
   ============================================================ */

function showPasswordGate(user) {
    pendingLoginUserId = user.id;

    passwordGateAvatar.textContent = user.profile.name.charAt(0).toUpperCase();
    passwordGateName.textContent = user.profile.name;
    passwordGateInput.value = "";
    passwordGateError.textContent = "";

    profileSection.classList.add("hidden");
    passwordGate.classList.remove("hidden");
    passwordGateInput.focus();
}

function hidePasswordGate() {
    pendingLoginUserId = null;
    passwordGateError.textContent = "";
    passwordGate.classList.add("hidden");
}

function attemptPasswordLogin() {
    if (!pendingLoginUserId) return;

    const users = getUsers();
    const user = users.find(u => u.id === pendingLoginUserId);

    if (!user) {
        hidePasswordGate();
        showProfiles();
        return;
    }

    if (passwordGateInput.value === user.password) {
        hidePasswordGate();
        selectProfile(user.id);
        return;
    }

    passwordGateError.textContent = "Contraseña incorrecta. Intenta de nuevo.";
    passwordGateInput.value = "";
    passwordGateInput.focus();
}


/* ============================================================
   5. PROFILE MENU (topbar)
   ============================================================ */

// ----------------------------------------
// UPDATE PROFILE BUTTON
// ----------------------------------------
function updateProfileUI() {
    if (!currentUser) return;

    const name = currentUser.profile.name;
    const firstLetter = name.charAt(0).toUpperCase();

    profileButtonName.textContent = name;
    profileButtonAvatar.textContent = firstLetter;
    profileMenuName.textContent = name;
    profileMenuAvatar.textContent = firstLetter;
}


/* ============================================================
   5b. CATEGORÍAS Y SUBCATEGORÍAS
   ============================================================ */

function findCategory(categoryId) {
    return categories.find(cat => cat.id === categoryId) || null;
}

function findSubcategory(categoryId, subcategoryId) {
    const category = findCategory(categoryId);
    if (!category) return null;
    return category.subcategories.find(sub => sub.id === subcategoryId) || null;
}

function categoryName(categoryId) {
    if (categoryId === "uncategorized") return "Sin categoría";
    const category = findCategory(categoryId);
    return category ? category.name : "Sin categoría";
}

function subcategoryName(categoryId, subcategoryId) {
    const sub = findSubcategory(categoryId, subcategoryId);
    return sub ? sub.name : "";
}

// Productos visibles según la categoría en la que estemos parados
function getVisibleProducts() {
    if (currentCategoryId === null) {
        return products;
    }

    if (currentCategoryId === "uncategorized") {
        return products.filter(prod => !prod.category);
    }

    return products.filter(prod =>
        prod.category === currentCategoryId &&
        (currentSubcategoryId === null || prod.subcategory === currentSubcategoryId)
    );
}

function countProductsIn(categoryId, subcategoryId = null) {
    if (categoryId === "uncategorized") {
        return products.filter(prod => !prod.category).length;
    }
    return products.filter(prod =>
        prod.category === categoryId &&
        (subcategoryId === null || prod.subcategory === subcategoryId)
    ).length;
}

// Redibuja la lista respetando la categoría actual
function refreshProducts() {
    display(getVisibleProducts());
}

// ----------------------------------------
// VISTAS
// ----------------------------------------
function setActiveNav(button) {
    productsBt.classList.toggle("active", button === "products");
    categoriesBt.classList.toggle("active", button === "categories");
}

function showProductsView() {
    setActiveNav("products");
    categoriesView.classList.add("hidden");

    searchPan.classList.remove("hidden");
    productsTitle.classList.remove("hidden");
    allProducts.classList.remove("hidden");
    actionsBar.classList.remove("hidden");

    renderBreadcrumb();
    refreshProducts();
}

function showCategoriesView() {
    setActiveNav("categories");
    searchPan.classList.add("hidden");
    productsTitle.classList.add("hidden");
    allProducts.classList.add("hidden");
    actionsBar.classList.add("hidden");
    breadcrumb.classList.add("hidden");

    categoriesView.classList.remove("hidden");
    renderCategories();
}

function openCategory(categoryId, subcategoryId = null) {
    currentCategoryId = categoryId;
    currentSubcategoryId = subcategoryId;

    searchInp.value = "";
    showProductsView();
}

// ----------------------------------------
// BREADCRUMB
// ----------------------------------------
function renderBreadcrumb() {
    if (currentCategoryId === null) {
        breadcrumb.classList.add("hidden");
        breadcrumb.innerHTML = "";
        productsTitle.textContent = "Productos";
        return;
    }

    breadcrumb.classList.remove("hidden");

    const catName = categoryName(currentCategoryId);
    let html = `
        <button class="crumb" data-crumb="all" type="button">Todos los productos</button>
        <span class="crumbSep">/</span>
    `;

    if (currentSubcategoryId === null) {
        html += `<span class="crumb current">${catName}</span>`;
        productsTitle.textContent = catName;
    } else {
        const subName = subcategoryName(currentCategoryId, currentSubcategoryId);
        html += `
            <button class="crumb" data-crumb="category" type="button">${catName}</button>
            <span class="crumbSep">/</span>
            <span class="crumb current">${subName}</span>
        `;
        productsTitle.textContent = subName;
    }

    breadcrumb.innerHTML = html;
}

// ----------------------------------------
// LISTA DE CATEGORÍAS
// ----------------------------------------
function renderCategories() {
    categoryTree.innerHTML = "";

    const looseCount = products.filter(prod => !prod.category).length;

    if (categories.length === 0 && looseCount === 0) {
        categoryTree.innerHTML = `
            <p class="emptyState">
                Todavía no hay categorías. Crea la primera para empezar a organizar el inventario.
            </p>
        `;
        return;
    }

    for (let category of categories) {
        const card = document.createElement("article");
        card.classList.add("categoryCard");
        card.dataset.categoryId = category.id;

        const subs = category.subcategories.map(sub => `
            <li class="subItem">
                <button class="subName" data-open-sub="${sub.id}" type="button">${sub.name}</button>
                <span class="categoryCount">${countProductsIn(category.id, sub.id)}</span>
                <button class="catBt" data-rename-sub="${sub.id}" type="button">Renombrar</button>
                <button class="catBt danger" data-delete-sub="${sub.id}" type="button">Eliminar</button>
            </li>
        `).join("");

        card.innerHTML = `
            <div class="categoryCardHead">
                <button class="categoryName" data-open-cat="${category.id}" type="button">
                    ${category.name}
                </button>
                <span class="categoryCount">${countProductsIn(category.id)} productos</span>
            </div>

            ${subs
                ? `<ul class="subList">${subs}</ul>`
                : `<p class="subEmpty">Sin subcategorías todavía.</p>`}

            <div class="categoryCardActions">
                <button class="catBt" data-add-sub="${category.id}" type="button">+ Subcategoría</button>
                <button class="catBt" data-rename-cat="${category.id}" type="button">Renombrar</button>
                <button class="catBt danger" data-delete-cat="${category.id}" type="button">Eliminar</button>
            </div>
        `;

        categoryTree.appendChild(card);
    }

    // Productos que todavía no tienen categoría (datos anteriores a esta versión)
    if (looseCount > 0) {
        const card = document.createElement("article");
        card.classList.add("categoryCard", "loose");
        card.innerHTML = `
            <div class="categoryCardHead">
                <button class="categoryName" data-open-cat="uncategorized" type="button">
                    Sin categoría
                </button>
                <span class="categoryCount">${looseCount} productos</span>
            </div>
            <p class="subEmpty">
                Productos que todavía no pertenecen a ninguna categoría.
            </p>
        `;
        categoryTree.appendChild(card);
    }
}

// ----------------------------------------
// CREAR / RENOMBRAR / ELIMINAR
// ----------------------------------------
function createCategory() {
    const name = prompt("Nombre de la nueva categoría:");
    if (!name) return;

    const cleanName = name.trim();
    if (!cleanName) return;

    const alreadyExists = categories.some(
        cat => cat.name.toLowerCase() === cleanName.toLowerCase()
    );

    if (alreadyExists) {
        alert("Ya existe una categoría con ese nombre.");
        return;
    }

    categories.push({
        id: crypto.randomUUID(),
        name: cleanName,
        subcategories: []
    });

    saveCurrentUser();
    renderCategories();
}

function createSubcategory(categoryId) {
    const category = findCategory(categoryId);
    if (!category) return;

    const name = prompt(`Nueva subcategoría dentro de "${category.name}":`);
    if (!name) return;

    const cleanName = name.trim();
    if (!cleanName) return;

    const alreadyExists = category.subcategories.some(
        sub => sub.name.toLowerCase() === cleanName.toLowerCase()
    ); if (alreadyExists) {
        alert("Ya existe una subcategoría con ese nombre.");
        return;
    }

    category.subcategories.push({
        id: crypto.randomUUID(),
        name: cleanName
    });

    saveCurrentUser();
    renderCategories();
}

function renameCategory(categoryId) {
    const category = findCategory(categoryId);
    if (!category) return;

    const newName = prompt("Nuevo nombre:", category.name);
    if (!newName) return;

    const cleanName = newName.trim();
    if (!cleanName) return;

    category.name = cleanName;

    saveCurrentUser();
    renderCategories();
}

function renameSubcategory(categoryId, subcategoryId) {
    const sub = findSubcategory(categoryId, subcategoryId);
    if (!sub) return;

    const newName = prompt("Nuevo nombre:", sub.name);
    if (!newName) return;

    const cleanName = newName.trim();
    if (!cleanName) return;

    sub.name = cleanName;

    saveCurrentUser();
    renderCategories();
}

function deleteCategory(categoryId) {
    const category = findCategory(categoryId);
    if (!category) return;

    const affected = countProductsIn(categoryId);

    const confirmed = confirm(
        `¿Eliminar la categoría "${category.name}"?\n\n` +
        `Los ${affected} producto(s) que contiene NO se eliminan: quedan como "Sin categoría".`
    );
    if (!confirmed) return;

    // Los productos se conservan, solo pierden la referencia
    for (let product of products) {
        if (product.category === categoryId) {
            product.category = null;
            product.subcategory = null;
        }
    }

    const index = categories.findIndex(cat => cat.id === categoryId);
    if (index !== -1) categories.splice(index, 1);

    if (currentCategoryId === categoryId) {
        currentCategoryId = null;
        currentSubcategoryId = null;
    }

    saveCurrentUser();
    renderCategories();
}

function deleteSubcategory(categoryId, subcategoryId) {
    const category = findCategory(categoryId);
    const sub = findSubcategory(categoryId, subcategoryId);
    if (!category || !sub) return;

    const affected = countProductsIn(categoryId, subcategoryId);

    const confirmed = confirm(
        `¿Eliminar la subcategoría "${sub.name}"?\n\n` +
        `Los ${affected} producto(s) siguen en "${category.name}", sin subcategoría.`
    );
    if (!confirmed) return;

    for (let product of products) {
        if (product.category === categoryId && product.subcategory === subcategoryId) {
            product.subcategory = null;
        }
    }

    const index = category.subcategories.findIndex(item => item.id === subcategoryId);
    if (index !== -1) category.subcategories.splice(index, 1);

    if (currentSubcategoryId === subcategoryId) {
        currentSubcategoryId = null;
    }

    saveCurrentUser();
    renderCategories();
}


/* ============================================================
   6. PRODUCT DISPLAY
   ============================================================ */

function display(prods) {
    allProducts.innerHTML = "";
    for (let prod of prods) {
        const li = document.createElement("li");
        li.classList.add("productCard");
        li.id = prod.id;
        li.dataset.id = prod.id;

        // Etiqueta de categoría (solo si el producto tiene una)
        let catLine = "";
        if (prod.category) {
            const subName = prod.subcategory ? subcategoryName(prod.category, prod.subcategory) : "";
            catLine = `<p class="productCat">${categoryName(prod.category)}${subName ? " › " + subName : ""}</p>`;
        }

        // Resumen de tallas/colores (solo productos de ropa con variantes)
        let variantLine = "";
        if (Array.isArray(prod.variants) && prod.variants.length > 0) {
            const sizes = [...new Set(prod.variants.map(v => v.size))];
            const colors = [...new Set(prod.variants.map(v => v.color).filter(Boolean))];
            const sizesText = `Tallas: ${sizes.join(", ")}`;
            const colorsText = colors.length > 0 ? ` · Colores: ${colors.join(", ")}` : "";
            variantLine = `<p class="variantSummary">${sizesText}${colorsText}</p>`;
        }

        li.innerHTML = `
            <img class = " pr" src="${prod.image}" alt="">
            <div class = "productInfo">
                <h3>${prod.name}</h3>
                <p>$${prod.price}</p>
                <p><strong>Stock:</strong> ${prod.quantity}</p>
                ${catLine}
                ${variantLine}
            </div>
        `;
        allProducts.appendChild(li);
    }
}

// async function loadProducts() {
//     const response = await fetch("./products.json");
//     products = await response.json();
//     allProducts.innerHTML = "";
//     display(products);
// };
// loadProducts();


/* ============================================================
   7. SEARCH / FILTER
   La búsqueda ahora trabaja sobre los productos visibles,
   es decir, respeta la categoría en la que estemos parados.
   ============================================================ */

function filterAn() {
    let filteredProducts = [];
    const text = searchInp.value.trim();
    const base = getVisibleProducts();

    if (text === "") {
        display(base);
        return;
    }

    switch (filterCat.value) {
        case "name":
            const keywords = text.toLowerCase();
            filteredProducts = base.filter(prod => prod.name.toLowerCase().includes(keywords));
            break;
        case "maxPrice":
            filteredProducts = base.filter(prod => prod.price <= Number(text)).sort();
            break;
        case "minPrice":
            searchInp.type = "number";
            searchInp.placeholder = "Precio mínimo del producto...";
            filteredProducts = base.filter(prod => prod.price >= Number(text));
            break;
        case "quantity":
            searchInp.type = "number";
            searchInp.placeholder = "Ingresa un apróximado ...";
            filteredProducts = base
                .filter(prod => prod.quantity <= Number(text))
                .sort();
            break;
    }

    display(filteredProducts);
}


/* ============================================================
   8. BILL / HISTORIAL HELPERS
   ============================================================ */

function updateBill() {
    // Close the panel
    accumulatePanel.classList.remove("show");
    accumulatePanel.classList.add("closing");

    // Reset the accumulator state
    bill = 0;
    myList = [];

    // VERY IMPORTANT:
    // After any action is finished/cancelled, return to normal bill mode.
    act = "bill";
}

function addToHistorial() {
    historial.push({
        "id": historial.length + 1,
        "venta": `${myList}`,
        "total": bill,
        "fecha": new Date()
    });
}


/* ============================================================
   9. MODAL HELPERS
   ============================================================ */

function closeModal() {
    const modal = overlay.querySelector(".modal");
    if (modal) {
        modal.classList.remove("show");
        modal.classList.add("closing");
    }
    overlay.classList.add("hidden");
    act = "bill";
}


/* ============================================================
   10. CONFIRM / CANCEL ACTIONS
   ============================================================ */

function confirmButton() {
    switch (act) {

        // =========================
        // TIPO DE NEGOCIO (nuevo perfil)
        // =========================
        case "storeType": {
            if (!selectedStoreType) {
                alert("Elige un tipo de negocio para continuar.");
                return;
            }

            closeModal();

            if (selectedStoreType === "clothing") {
                // Falta configurar tallas antes de crear el perfil.
                act = "clothingSizeSystem";
                myInventaryActions("clothingSizeSystem");
                return;
            }

            finishProfileCreation();
            return;
        }

        // =========================
        // TALLAS DE LA TIENDA DE ROPA (nuevo perfil)
        // =========================
        case "clothingSizeSystem": {
            if (!selectedSizeSystem) {
                alert("Elige un sistema de tallas para continuar.");
                return;
            }

            let sizeList;
            const system = SIZE_SYSTEMS.find(sys => sys.id === selectedSizeSystem);

            if (system && system.defaultSizes) {
                sizeList = system.defaultSizes;
            } else {
                const sizeListInput = document.getElementById("sizeListInput");
                const raw = sizeListInput ? sizeListInput.value.trim() : "";

                if (!raw) {
                    alert("Escribe al menos una talla, separadas por comas.");
                    return;
                }

                sizeList = raw.split(",").map(s => s.trim()).filter(Boolean);

                if (sizeList.length === 0) {
                    alert("Escribe al menos una talla válida.");
                    return;
                }
            }

            pendingClothingConfig = { sizeSystem: selectedSizeSystem, sizeList };

            closeModal();
            finishProfileCreation();
            return;
        }

        // =========================
        // ADD PRODUCT
        // =========================
        case "addProduct": {
            const newName = document.getElementById("newName");
            const newPrice = document.getElementById("nprice");
            const newImg = document.getElementById("nimg");
            const newStock = document.getElementById("nstock");
            const newCategory = document.getElementById("ncategory");
            const newSubcategory = document.getElementById("nsubcategory");

            let myIm = newImg.value;
            let myStock = newStock.valueAsNumber;

            if (newName.value.trim() === "" || newPrice.value.trim() === "") {
                alert("Name or price empty; these are required");
                return;
            }

            // ------------------------------------------------------
            // TIENDA DE ROPA: leer tallas/colores si el producto los usa
            // ------------------------------------------------------
            const isClothing = currentUser && currentUser.storeType === "clothing";
            let variants = null;

            if (isClothing) {
                const variantGrid = document.getElementById("variantModeGrid");
                const selectedBtn = variantGrid ? variantGrid.querySelector(".storeTypeOption.selected") : null;
                const mode = selectedBtn ? selectedBtn.dataset.variantMode : "unique";

                if (mode === "sameAll") {
                    const checked = [...document.querySelectorAll("#variantDetails .sizeCheck:checked")].map(c => c.value);
                    const qtyInput = document.getElementById("sameAllQty");
                    const qty = qtyInput ? qtyInput.valueAsNumber : NaN;

                    if (checked.length === 0 || Number.isNaN(qty) || qty < 0) {
                        alert("Elige al menos una talla y una cantidad válida.");
                        return;
                    }

                    variants = checked.map(size => ({ size, color: null, quantity: qty }));

                } else if (mode === "perSize") {
                    const rows = document.querySelectorAll("#perSizeQtyRows .sizeQtyRow");

                    if (rows.length === 0) {
                        alert("Elige al menos una talla.");
                        return;
                    }

                    variants = [];
                    for (const row of rows) {
                        const size = row.dataset.size;
                        const qty = row.querySelector(".perSizeQty").valueAsNumber;

                        if (Number.isNaN(qty) || qty < 0) {
                            alert(`Ingresa una cantidad válida para la talla ${size}.`);
                            return;
                        }
                        variants.push({ size, color: null, quantity: qty });
                    }

                } else if (mode === "colorSize") {
                    const blocks = document.querySelectorAll("#colorBlocks .colorBlock");

                    if (blocks.length === 0) {
                        alert("Agrega al menos un color.");
                        return;
                    }

                    variants = [];
                    for (const block of blocks) {
                        const colorName = block.querySelector(".colorNameInput").value.trim();

                        if (!colorName) {
                            alert("Ponle nombre a cada color.");
                            return;
                        }

                        const rows = block.querySelectorAll(".sizeQtyRow");
                        if (rows.length === 0) {
                            alert(`Elige al menos una talla para el color "${colorName}".`);
                            return;
                        }

                        for (const row of rows) {
                            const size = row.dataset.size;
                            const qty = row.querySelector(".perSizeQty").valueAsNumber;

                            if (Number.isNaN(qty) || qty < 0) {
                                alert(`Ingresa una cantidad válida para ${colorName} / ${size}.`);
                                return;
                            }
                            variants.push({ size, color: colorName, quantity: qty });
                        }
                    }
                }
                // mode === "unique" → variants queda null, se usa el stock normal
            }

            if (variants) {
                myStock = variants.reduce((sum, v) => sum + v.quantity, 0);
            } else if (newStock.value.trim() === "" || Number.isNaN(myStock)) {
                myStock = 0;
            }

            if (newImg.value.trim() === "") {
                myIm = "https://i0.wp.com/tinasbotanicals.com/wp-content/uploads/2025/01/No-Product-Image-Available.png?fit=800%2C800&ssl=1";
            }

            const newId = `${newName.value[0].toLowerCase()}-${Date.now()}`;

            const chosenCategory = newCategory && newCategory.value ? newCategory.value : null;
            const chosenSubcategory = newSubcategory && newSubcategory.value ? newSubcategory.value : null;

            const createdProduct = {
                id: newId,
                name: newName.value,
                price: newPrice.valueAsNumber,
                quantity: myStock,
                image: myIm,
                category: chosenCategory,
                subcategory: chosenCategory ? chosenSubcategory : null,
                createdIn: new Date()
            };

            if (isClothing) {
                createdProduct.variants = variants; // null si el producto es "Artículo único"

                const season = document.getElementById("nseason");
                const collection = document.getElementById("ncollection");
                const series = document.getElementById("nseries");
                const supplier = document.getElementById("nsupplier");

                createdProduct.season = season ? season.value.trim() : "";
                createdProduct.collection = collection ? collection.value.trim() : "";
                createdProduct.series = series ? series.value.trim() : "";
                createdProduct.supplier = supplier ? supplier.value.trim() : "";
            }

            products.push(createdProduct);

            // Primer movimiento del historial de este producto
            recordStockChange(
                createdProduct,
                "created",
                myStock,
                variants ? "Tallas/colores iniciales" : "Stock inicial"
            );

            refreshProducts();
            closeModal();
            act = "bill";
            break;
        }

        // =========================
        // RESTOCK
        // =========================
        case "restock": {
            let itemsUpdated = 0;

            for (let product of getVisibleProducts()) {
                const packSelect = document.getElementById(`pack-${product.id}`);
                const qtyInput = document.getElementById(`inputRestock-${product.id}`);
                if (!packSelect || !qtyInput) continue;

                const parsed = parseRestockExpression(qtyInput.value, packSelect.value);

                // Campo vacío: este producto simplemente no se toca
                if (parsed.empty) continue;

                if (!parsed.ok) {
                    alert(
                        `La cantidad de "${product.name}" no es válida.\n\n` +
                        `Usa números con + y -, por ejemplo: 2 + 16, 10, -3.`
                    );
                    qtyInput.focus();
                    qtyInput.select();
                    return;
                }

                if (parsed.units === 0) continue;

                // ACTUALIZAR STOCK
                product.quantity += parsed.units;
                itemsUpdated++;

                const isAdjustment = packSelect.value === "none";
                const detail = `${packLabel(packSelect.value)} · ${qtyInput.value.trim()}`;

                recordStockChange(
                    product,
                    isAdjustment ? "adjustment" : "restock",
                    parsed.units,
                    detail
                );

                // "Ninguno" no es un empaque, no se guarda como preferencia
                if (!isAdjustment) {
                    restockPreferences[product.id] = Number(packSelect.value);
                }
            }

            // VALIDAR QUE HUBO RESTOCK
            if (itemsUpdated === 0) {
                alert("Ingresa al menos una cantidad distinta de 0 para guardar.");
                return;
            }

            refreshProducts();
            alert("Stock actualizado exitosamente.");
            closeModal();
            act = "bill";
            break;
        }

        // =========================
        // CHANGE PRICE
        // =========================
        case "changePrice": {
            if (myList.length === 0) {
                alert("No hay productos seleccionados.");
                return;
            }

            for (let elem of myList) {
                const product = products.find(value => String(value.id) === String(elem.id));
                if (!product) continue;

                const inp = document.getElementById(`${elem.id}inputChangePrice`);
                if (!inp) continue;

                const newPrice = inp.valueAsNumber;

                if (Number.isNaN(newPrice) || newPrice < 0) {
                    alert(`Ingresa un precio válido para ${product.name}.`);
                    return;
                }

                product.price = newPrice;
            }

            refreshProducts();
            alert("Precio actualizado.");

            // Clear change-price queue
            myList = [];
            act = "bill";

            // Close panel
            accumulatePanel.classList.remove("show");
            accumulatePanel.classList.add("closing");

            // Make sure Accept is visible next time
            accConfirmBt.classList.remove("hidden");
            break;
        }

        // =========================
        // BILL
        // =========================
        case "bill": {
            if (myList.length === 0 || bill === 0) {
                alert("No hay productos en la cuenta.");
                return;
            }

            for (let consume of myList) {
                const product = products.find(value => String(value.id) === String(consume.id));

                if (!product) {
                    console.error("Producto no encontrado:", consume.id);
                    continue;
                }

                const left = product.quantity - consume.quantity;
                product.quantity -= consume.quantity;

                // La venta también es un movimiento de inventario
                recordStockChange(product, "sale", -consume.quantity, `Venta · ${consume.quantity} u.`);

                if (left < 0) {
                    alert(`${product.name}: se vendieron ${-left} unidades de más.`);
                }
            }

            // Save sale BEFORE clearing myList
            addToHistorial();
            alert(`Venta finalizada. Total: $${bill}`);

            // Reset everything
            bill = 0;
            myList = [];
            act = "bill";

            refreshProducts();

            accumulatePanel.classList.remove("show");
            accumulatePanel.classList.add("closing");
            break;
        }

        // =========================
        // DELETE
        // =========================
        case "delete": {
            if (myList.length === 0) {
                alert("No hay productos seleccionados.");
                return;
            }

            for (let toDelete of myList) {
                const index = products.findIndex(value => String(value.id) === String(toDelete.id));
                if (index !== -1) {
                    const product = products[index];
                    // Dejamos constancia de cuánto stock se fue con el producto
                    recordStockChange(product, "deleted", -product.quantity, "Producto eliminado");
                    products.splice(index, 1);
                }
            }

            refreshProducts();
            alert("Producto(s) eliminado(s).");

            myList = [];
            act = "bill";

            accumulatePanel.classList.remove("show");
            accumulatePanel.classList.add("closing");

            accConfirmBt.classList.remove("hidden");
            break;
        }
    }

    saveCurrentUser();
    display(products);
}

function cancelCurrentAction() {
    switch (act) {
        case 'storeType': {
            selectedStoreType = null;
            selectedSizeSystem = null;
            pendingClothingConfig = null;
            closeModal();
            break;
        }
        case 'clothingSizeSystem': {
            selectedStoreType = null;
            selectedSizeSystem = null;
            pendingClothingConfig = null;
            closeModal();
            break;
        }
        case 'addProduct': {
            const newImg = document.getElementById("nimg");
            if (newImg) newImg.value = "";
            closeModal();
            break;
        }
        case 'restock':
            closeModal();
            break;
        case 'history':
            closeModal();
            break;
        case 'bill':
            updateBill();
            break;
        case 'changePrice':
            updateBill();
            break;
        case 'delete':
            updateBill();
            break;
    }
}


/* ============================================================
   11. INVENTORY ACTION MODALS (add product / restock / history)
   ============================================================ */

function myInventaryActions(action) {
    overlay.classList.remove("hidden");
    modali.classList.remove("closing");
    modali.classList.add("show");

    switch (action) {
        case 'storeType': {
            const optionsHtml = STORE_TYPES.map(type => `
                <button class="storeTypeOption" type="button" data-store-type="${type.id}">
                    <span class="offerIcon">${type.icon}</span>
                    ${type.label}
                </button>
            `).join("");

            modalcont.innerHTML = `
                <div class="restockModalContainer show">
                    <h3>¿Qué tipo de negocio vas a manejar?</h3>
                    <p class="restockHint">
                        Esto ayuda a Creatussiness a adaptar el inventario y el
                        Restock a cómo funciona tu negocio.
                    </p>

                    <div class="storeTypeGrid">
                        ${optionsHtml}
                    </div>

                    <div class="buttons">
                        <button id="inventaryCancelBt" class="cancelBt" type="button">Cancelar</button>
                        <button id="inventaryConfirmBt" class="confirmBt" type="button">Aceptar</button>
                    </div>
                </div>
            `;

            modalcont.querySelectorAll(".storeTypeOption").forEach(button => {
                if (button.dataset.storeType === selectedStoreType) {
                    button.classList.add("selected");
                }
                button.addEventListener("click", () => {
                    selectedStoreType = button.dataset.storeType;
                    modalcont.querySelectorAll(".storeTypeOption").forEach(opt =>
                        opt.classList.toggle("selected", opt === button)
                    );
                });
            });

            document.getElementById("inventaryCancelBt").addEventListener("click", cancelCurrentAction);
            document.getElementById("inventaryConfirmBt").addEventListener("click", confirmButton);
            break;
        }

        case 'clothingSizeSystem': {
            const optionsHtml = SIZE_SYSTEMS.map(sys => `
                <button class="storeTypeOption" type="button" data-size-system="${sys.id}">
                    <span class="offerIcon">${sys.icon}</span>
                    ${sys.label}
                </button>
            `).join("");

            modalcont.innerHTML = `
                <div class="restockModalContainer show">
                    <h3>¿Qué tallas maneja tu tienda de ropa?</h3>
                    <p class="restockHint">
                        Elige el sistema que usas. Podrás crear productos con
                        estas tallas y con las cantidades que quieras para cada una.
                    </p>

                    <div class="storeTypeGrid">
                        ${optionsHtml}
                    </div>

                    <div id="sizeListField" class="productInputs hidden" style="margin-top: 0.8rem;">
                        <input
                            id="sizeListInput"
                            type="text"
                            placeholder="Escribe tus tallas separadas por comas (ej. 36, 38, 40, 42)"
                        >
                    </div>

                    <div class="buttons">
                        <button id="inventaryCancelBt" class="cancelBt" type="button">Cancelar</button>
                        <button id="inventaryConfirmBt" class="confirmBt" type="button">Aceptar</button>
                    </div>
                </div>
            `;

            const sizeListField = document.getElementById("sizeListField");
            const sizeListInput = document.getElementById("sizeListInput");

            const placeholders = {
                numeric: "Escribe tus tallas separadas por comas (ej. 36, 38, 40, 42)",
                shoe: "Escribe tus tallas separadas por comas (ej. 38, 39, 40, 41, 42)",
                custom: "Escribe tus tallas separadas por comas (ej. Único, Talla A, Talla B)"
            };

            modalcont.querySelectorAll(".storeTypeOption").forEach(button => {
                const sysId = button.dataset.sizeSystem;
                if (sysId === selectedSizeSystem) button.classList.add("selected");

                button.addEventListener("click", () => {
                    selectedSizeSystem = sysId;
                    modalcont.querySelectorAll(".storeTypeOption").forEach(opt =>
                        opt.classList.toggle("selected", opt === button)
                    );

                    if (sysId === "letter") {
                        sizeListField.classList.add("hidden");
                    } else {
                        sizeListField.classList.remove("hidden");
                        sizeListInput.placeholder = placeholders[sysId] || placeholders.custom;
                        sizeListInput.focus();
                    }
                });
            });

            document.getElementById("inventaryCancelBt").addEventListener("click", cancelCurrentAction);
            document.getElementById("inventaryConfirmBt").addEventListener("click", confirmButton);
            break;
        }

        case 'addProduct': {
            // Si estamos dentro de una categoría, el producto nace ahí
            const presetCategory = currentCategoryId === "uncategorized" ? null : currentCategoryId;
            const presetSubcategory = presetCategory ? currentSubcategoryId : null;

            const categoryOptions = [`<option value="">Sin categoría</option>`]
                .concat(categories.map(cat => `
                    <option value="${cat.id}" ${cat.id === presetCategory ? "selected" : ""}>
                        ${cat.name}
                    </option>
                `))
                .join("");

            const isClothing = currentUser && currentUser.storeType === "clothing";

            const clothingBlockHtml = isClothing ? `
                <div class="clothingProductBlock">
                    <h4 class="clothingBlockTitle">Tipo de producto</h4>
                    <div class="storeTypeGrid" id="variantModeGrid">
                        ${VARIANT_MODES.map(mode => `
                            <button class="storeTypeOption" type="button" data-variant-mode="${mode.id}">
                                <span class="offerIcon">${mode.icon}</span>
                                ${mode.label}
                            </button>
                        `).join("")}
                    </div>

                    <div id="variantDetails" class="variantDetails"></div>

                    <h4 class="clothingBlockTitle">Detalles adicionales (opcional)</h4>
                    <div class="productInputs">
                        <input id="nseason" type="text" placeholder="Temporada (ej. Verano 2026)">
                        <input id="ncollection" type="text" placeholder="Colección">
                        <input id="nseries" type="text" placeholder="Serie">
                        <input id="nsupplier" type="text" placeholder="Proveedor">
                    </div>
                </div>
            ` : "";

            modalcont.innerHTML = `
                <div class="modal show">
                    <h3 id="modalTitle">¡Agrega un nuevo producto!</h3>

                    <div class="productInputs">
                        <input id="newName" type="text" placeholder="Nombra tu producto">
                        <input id="nprice" type="number" placeholder="Ingresa precio">
                        <input id="nimg" type="url" placeholder="Imagen URL">
                        <input id="nstock" type="number" placeholder="Stock inicial">
                    </div>

                    <div class="productInputs categoryInputs">
                        <select id="ncategory">${categoryOptions}</select>
                        <select id="nsubcategory"></select>
                    </div>

                    ${clothingBlockHtml}

                    <div class="buttons">
                        <button id="inventaryCancelBt" class="cancelBt" type="button">Cancelar</button>
                        <button id="inventaryConfirmBt" class="confirmBt" type="button">Aceptar</button>
                    </div>
                </div>
            `;

            const categorySelect = document.getElementById("ncategory");
            const subcategorySelect = document.getElementById("nsubcategory");

            function fillSubcategories(selectedSubId) {
                const category = findCategory(categorySelect.value);

                if (!category || category.subcategories.length === 0) {
                    subcategorySelect.innerHTML = `<option value="">Sin subcategoría</option>`;
                    subcategorySelect.disabled = true;
                    return;
                }

                subcategorySelect.disabled = false;
                subcategorySelect.innerHTML = [`<option value="">Sin subcategoría</option>`]
                    .concat(category.subcategories.map(sub => `
                        <option value="${sub.id}" ${sub.id === selectedSubId ? "selected" : ""}>
                            ${sub.name}
                        </option>
                    `))
                    .join("");
            }

            fillSubcategories(presetSubcategory);
            categorySelect.addEventListener("change", () => fillSubcategories(null));

            // ------------------------------------------------------
            // TIENDA DE ROPA: tallas, colores y cantidades por variante
            // ------------------------------------------------------
            if (isClothing) {
                const sizeList = (clothingConfig && Array.isArray(clothingConfig.sizeList))
                    ? clothingConfig.sizeList
                    : [];

                const variantGrid = document.getElementById("variantModeGrid");
                const variantDetails = document.getElementById("variantDetails");
                const stockInput = document.getElementById("nstock");

                let selectedVariantMode = "unique";

                function sizeCheckboxesHtml() {
                    return sizeList.map(size => `
                        <label class="sizeCheckboxOption">
                            <input type="checkbox" class="sizeCheck" value="${size}"> ${size}
                        </label>
                    `).join("");
                }

                function qtyRowsHtml(sizes) {
                    return sizes.map(size => `
                        <div class="sizeQtyRow" data-size="${size}">
                            <span>${size}</span>
                            <input type="number" min="0" class="perSizeQty" placeholder="Cantidad">
                        </div>
                    `).join("");
                }

                function renderPerSizeRows(scopeEl, rowsContainer) {
                    const checked = [...scopeEl.querySelectorAll(".sizeCheck:checked")].map(c => c.value);
                    rowsContainer.innerHTML = qtyRowsHtml(checked);
                }

                function addColorBlock() {
                    const container = document.getElementById("colorBlocks");
                    if (!container) return;

                    const block = document.createElement("div");
                    block.className = "colorBlock";
                    block.innerHTML = `
                        <div class="productInputs">
                            <input type="text" class="colorNameInput" placeholder="Nombre del color (ej. Negro)">
                            <button class="cancelBt removeColorBt" type="button">Eliminar</button>
                        </div>
                        <div class="sizeCheckboxGrid">${sizeCheckboxesHtml()}</div>
                        <div class="sizeQtyRows colorQtyRows"></div>
                    `;
                    container.appendChild(block);

                    const rows = block.querySelector(".colorQtyRows");
                    block.querySelectorAll(".sizeCheck").forEach(chk => {
                        chk.addEventListener("change", () => renderPerSizeRows(block, rows));
                    });
                    block.querySelector(".removeColorBt").addEventListener("click", () => block.remove());
                }

                function renderVariantDetails() {
                    if (selectedVariantMode === "unique") {
                        variantDetails.innerHTML = "";
                        stockInput.disabled = false;
                        stockInput.placeholder = "Stock inicial";
                        return;
                    }

                    stockInput.disabled = true;
                    stockInput.value = "";
                    stockInput.placeholder = "Se calcula con las tallas";

                    if (sizeList.length === 0) {
                        variantDetails.innerHTML = `
                            <p class="restockHint">
                                Este perfil todavía no tiene tallas configuradas.
                            </p>
                        `;
                        return;
                    }

                    if (selectedVariantMode === "sameAll") {
                        variantDetails.innerHTML = `
                            <div class="sizeCheckboxGrid">${sizeCheckboxesHtml()}</div>
                            <input id="sameAllQty" type="number" min="0" class="sizeQtyInput" placeholder="Cantidad por talla seleccionada">
                        `;
                    } else if (selectedVariantMode === "perSize") {
                        variantDetails.innerHTML = `
                            <div class="sizeCheckboxGrid">${sizeCheckboxesHtml()}</div>
                            <div id="perSizeQtyRows" class="sizeQtyRows"></div>
                        `;
                        const rows = document.getElementById("perSizeQtyRows");
                        variantDetails.querySelectorAll(".sizeCheck").forEach(chk => {
                            chk.addEventListener("change", () => renderPerSizeRows(variantDetails, rows));
                        });
                    } else if (selectedVariantMode === "colorSize") {
                        variantDetails.innerHTML = `
                            <div id="colorBlocks" class="colorBlocks"></div>
                            <button id="addColorBt" class="cancelBt" type="button">+ Agregar color</button>
                        `;
                        document.getElementById("addColorBt").addEventListener("click", addColorBlock);
                        addColorBlock();
                    }
                }

                variantGrid.querySelectorAll(".storeTypeOption").forEach(button => {
                    if (button.dataset.variantMode === "unique") button.classList.add("selected");
                    button.addEventListener("click", () => {
                        selectedVariantMode = button.dataset.variantMode;
                        variantGrid.querySelectorAll(".storeTypeOption").forEach(opt =>
                            opt.classList.toggle("selected", opt === button)
                        );
                        renderVariantDetails();
                    });
                });

                renderVariantDetails();
            }

            document.getElementById("inventaryCancelBt").addEventListener("click", cancelCurrentAction);
            document.getElementById("inventaryConfirmBt").addEventListener("click", confirmButton);
            document.getElementById("newName").focus();

            const inputs = [
                document.getElementById("newName"),
                document.getElementById("nprice"),
                document.getElementById("nimg"),
                document.getElementById("nstock")
            ];

            inputs.forEach((input, index) => {
                input.addEventListener("keydown", (event) => {
                    if (event.key !== "Enter") return;
                    event.preventDefault();

                    let nextIndex = index + 1;
                    while (inputs[nextIndex] && inputs[nextIndex].disabled) {
                        nextIndex++;
                    }

                    const nextInput = inputs[nextIndex];
                    if (nextInput) {
                        nextInput.focus();
                    } else {
                        document.getElementById("inventaryConfirmBt").click();
                    }
                });
            });
            break;
        }

        case 'restock': {
            const restockables = getVisibleProducts();

            let restockRows = restockables.map(prod => {
                const preference = restockPreferences[prod.id];

                const packSelectOptions = PACK_OPTIONS.map(opt => `
                    <option value="${opt.value}" ${String(preference) === opt.value ? "selected" : ""}>
                        ${opt.label}
                    </option>
                `).join("");

                return `
                <div class="restockItem" data-id="${prod.id}">
                    <div class="restockInfo">
                        <strong>${prod.name}</strong>
                        <span>Stock actual: ${prod.quantity}</span>
                    </div>
                    <div class="restockInputs">
                        <select id="pack-${prod.id}">
                            ${packSelectOptions}
                        </select>
                        <input id="inputRestock-${prod.id}" class="restockQty" type="text"
                               inputmode="text" placeholder="ej: 2 + 16" value="">
                        <span class="restockPreview" id="preview-${prod.id}">= 0 u.</span>
                    </div>
                </div>
                `;
            }).join('');

            modalcont.innerHTML = `
                <div class="restockModalContainer show">
                    <h3>Reabastecer Inventario (Restock)</h3>
                    <p class="restockHint">
                        Puedes escribir sumas y restas. El primer número usa el empaque elegido
                        y los siguientes son unidades sueltas:
                        <code>Sixpack · 2 + 16</code> = 28 unidades.
                        Con <code>Ninguno</code> no hay conversión, así que <code>-3</code> descuenta 3 unidades.
                    </p>
                    <input type="text" id="restockFilter" class="inventorySearch inp" placeholder="Filtrar por nombre..." style="margin-bottom: 1rem; width: 100%;">

                    <div id="restockListContainer" class="billList restockScrollArea">
                        ${restockRows}
                    </div>

                    <div class="buttons">
                        <button id="inventaryCancelBt" class="cancelBt" type="button">Cancelar</button>
                        <button id="inventaryConfirmBt" class="confirmBt" type="button">Aceptar</button>
                    </div>
                </div>
            `;

            // Filtrado rápido dinámico
            const restockFilter = document.getElementById("restockFilter");
            restockFilter.addEventListener("input", () => {
                const query = restockFilter.value.toLowerCase();
                const items = modalcont.querySelectorAll(".restockItem");
                items.forEach(item => {
                    const name = item.querySelector("strong").textContent.toLowerCase();
                    item.style.display = name.includes(query) ? "flex" : "none";
                });
            });

            document.getElementById("inventaryCancelBt").addEventListener("click", cancelCurrentAction);
            document.getElementById("inventaryConfirmBt").addEventListener("click", confirmButton);

            function focusFirstRestockInput() {
                const items = getDisplayedRestockItems();
                if (items.length === 0) return;

                const select = items[0].querySelector("select");
                if (select) {
                    select.focus();
                }
            }

            focusFirstRestockInput();

            break;
        }

        // =========================
        // HISTORIAL DE INVENTARIO
        // Usa el mismo contenedor centrado del Restock (#modali)
        // =========================
        case 'history': {
            modalcont.innerHTML = `
                <div class="restockModalContainer show">
                    <h3>Historial de inventario</h3>
                    <p class="restockHint">
                        Cada movimiento de stock, del más reciente al más antiguo.
                        El stock que ya existía antes de activar el historial no aparece aquí.
                    </p>
                    <input type="text" id="historyFilter" class="inventorySearch inp" placeholder="Filtrar por producto...">

                    <div id="historyList" class="billList restockScrollArea"></div>

                    <div class="buttons">
                        <button id="inventaryCancelBt" class="cancelBt" type="button">Cerrar</button>
                    </div>
                </div>
            `;

            const historyList = document.getElementById("historyList");
            const historyFilter = document.getElementById("historyFilter");

            function renderHistory(query = "") {
                const clean = query.trim().toLowerCase();

                const entries = stockHistory
                    .filter(entry => entry.productName.toLowerCase().includes(clean))
                    .slice()
                    .reverse();

                if (entries.length === 0) {
                    historyList.innerHTML = `
                        <p class="historyEmpty">
                            Todavía no hay movimientos registrados.
                        </p>
                    `;
                    return;
                }

                historyList.innerHTML = entries.map(entry => `
                    <div class="historyItem">
                        <div class="historyInfo">
                            <strong>${entry.productName}</strong>
                            <span>
                                ${formatHistoryDate(entry.date)} ·
                                ${ACTION_LABELS[entry.action] || entry.action}${entry.unit ? " · " + entry.unit : ""}
                            </span>
                        </div>
                        <div class="historyDelta">
                            <strong class="${entry.change < 0 ? "down" : "up"}">
                                ${entry.change > 0 ? "+" : ""}${entry.change}
                            </strong>
                            <span>Stock: ${entry.resultingStock}</span>
                        </div>
                    </div>
                `).join("");
            }

            renderHistory();
            historyFilter.addEventListener("input", () => renderHistory(historyFilter.value));

            document.getElementById("inventaryCancelBt").addEventListener("click", cancelCurrentAction);
            break;
        }
    }
}


/* ============================================================
   12. BILL DISPLAY
   ============================================================ */

function displayBill(billListObj) {
    if (!billListObj) {
        console.error("billListObj does not exist");
        return;
    }

    billListObj.innerHTML = "";

    for (let consumedProduct of myList) {
        console.log("Rendering bill product:", consumedProduct);

        billListObj.innerHTML += `
            <div class="billItem" data-id="${consumedProduct.id}">
                <strong>${consumedProduct.orderid}</strong>
                <span>${consumedProduct.name}</span>
                <strong>$${consumedProduct.price}</strong>
                <button class="minusButton" type="button">−</button>
                <p>${consumedProduct.quantity}</p>
                <button class="deleteItem" data-id="${consumedProduct.id}">x</button>
            </div>
        `;
    }

    const totalElement = document.getElementById("billTotal");
    if (totalElement) {
        totalElement.textContent = `$${bill}`;
    }
}

function deleteItem(product, billListObj) {
    const index = myList.findIndex(value => value.id === product.id);
    if (index === -1) {
        return;
    }
    myList.splice(index, 1);
    bill -= product.price * product.quantity;
    displayBill(billListObj);
}


/* ============================================================
   13. ACCUMULATE ACTIONS (bill / changePrice / delete)
   ============================================================ */

function accumulateActions(action, event) {
    const card = event.target.closest(".productCard");
    if (!card) return;

    console.log("CARD ID:", card.dataset.id);
    console.log("PRODUCTS:", products);

    const product = products.find(prod => String(prod.id) === String(card.dataset.id));

    console.log("FOUND PRODUCT:", product);

    if (!product) {
        console.error("Product not found. Card ID:", card.dataset.id);
        return;
    }

    accumulatePanel.classList.remove("closing");
    accumulatePanel.classList.add("show");

    let obj = myList.find(value => String(value.id) === String(product.id));

    switch (action) {
        case 'bill': {
            // Add product to the bill
            if (obj === undefined) {
                myList.push({
                    id: product.id,
                    orderid: myList.length + 1,
                    name: product.name,
                    price: Number(product.price),
                    quantity: 1
                });
            } else {
                obj.quantity += 1;
            }

            // Add price to total
            bill += Number(product.price);

            // Create the bill panel
            accModalContent.innerHTML = `
                    <div class="billHeader">
                        <h2>Cuenta</h2>
                        <strong id="billTotal">$${bill}</strong>
                    </div>

                    <div id="billList" class="billList"></div>
                `;

            // Get the newly-created list
            const billListObj = document.getElementById("billList");

            // Render products
            displayBill(billListObj);

            // Handle minus/delete buttons
            billListObj.addEventListener("click", (event) => {
                const billItem = event.target.closest(".billItem");
                if (!billItem) return;

                const productId = billItem.dataset.id;
                const billProduct = myList.find(item => String(item.id) === String(productId));
                if (!billProduct) return;

                // MINUS
                if (event.target.classList.contains("minusButton")) {
                    if (billProduct.quantity === 1) {
                        deleteItem(billProduct, billListObj);
                        if (myList.length === 0) {
                            updateBill();
                        }
                        return;
                    }

                    billProduct.quantity -= 1;
                    bill -= Number(billProduct.price);
                    displayBill(billListObj);
                }
                // DELETE
                else if (event.target.classList.contains("deleteItem")) {
                    deleteItem(billProduct, billListObj);
                    if (myList.length === 0) {
                        updateBill();
                    }
                }
            });
            break;
        }

        case 'changePrice': {
            accConfirmBt.classList.remove("hidden");

            if (obj === undefined) {
                myList.push({
                    id: product.id,
                    name: product.name,
                    currentPrice: product.price
                });
            } else {
                alert("You already added this product to the change price queue");
                return;
            }

            accModalContent.innerHTML = `
                    <div class="billHeader">
                        <h2>Productos</h2>
                        <strong id="billTotal">${myList.length}</strong>
                    </div>
                    <div id ="changeList" class ="billList"></div>
                `;

            const changeListContainer = document.getElementById("changeList");
            for (let productc of myList) {
                changeListContainer.innerHTML += `
                                <div class="billItem">
                                    <span>${productc.name}</span>
                                    <strong>${productc.currentPrice}</strong>
                                    <input id="${productc.id}inputChangePrice" type="number" placeholder="Nuevo precio">
                                </div>
                                `;
            }
            break;
        }

        case 'delete': {
            accConfirmBt.classList.remove("hidden");

            if (obj === undefined) {
                myList.push({
                    id: product.id,
                    name: product.name,
                    createdIn: product.createdIn
                });
            } else {
                alert("You already added this product to the delete queue");
                return;
            }

            accModalContent.innerHTML = `
                    <div class="billHeader">
                        <h2>Productos</h2>
                        <strong id="billTotal">${myList.length}</strong>
                    </div>
                    <div id ="delList" class ="billList"></div>
                `;

            const deleteContainer = document.getElementById("delList");
            for (let productc of myList) {
                deleteContainer.innerHTML += `
                                <div class="billItem">
                                    <strong>${productc.name}</strong>
                                    <p>${productc.createdIn}</p>
                                    <span>${productc.id}</span>
                                </div>
                                `;
            }
            break;
        }
    }
}


/* ============================================================
   14. EVENT LISTENERS
   ============================================================ */

// --- Profile selection screen ---
document.getElementById("profileList").addEventListener("click", event => {
    const button = event.target.closest(".profileSelect");
    if (!button) return;

    const card = button.closest(".profileCard");
    const userId = card.dataset.profileId;

    const users = getUsers();
    const user = users.find(u => u.id === userId);
    if (!user) return;

    // Perfiles sin contraseña entran igual que siempre.
    if (user.password) {
        showPasswordGate(user);
    } else {
        selectProfile(userId);
    }
});

passwordGateSubmitBt.addEventListener("click", attemptPasswordLogin);

passwordGateInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        event.preventDefault();
        attemptPasswordLogin();
    }
});

passwordGateBackBt.addEventListener("click", () => {
    hidePasswordGate();
    showProfiles();
});

document.getElementById("createProfileBt").addEventListener("click", () => {
    // El primer paso de crear un perfil ahora es elegir el tipo de
    // negocio; el nombre y la contraseña se piden al final, una vez
    // que sabemos si hace falta configurar algo más (p. ej. ropa).
    selectedStoreType = null;
    selectedSizeSystem = null;
    pendingClothingConfig = null;

    act = "storeType";
    myInventaryActions("storeType");
});

// --- Profile menu (topbar) ---
profileButton.addEventListener("click", () => {
    profileMenu.classList.toggle("hidden");
    updateProfileUI();
});

closeProfileMenuBt.addEventListener("click", () => {
    profileMenu.classList.add("hidden");
});

changeProfileBt.addEventListener("click", () => {
    profileMenu.classList.add("hidden");
    showProfiles();
});

renameProfileBt.addEventListener("click", () => {
    if (!currentUser) return;

    const newName = prompt("Nuevo nombre:", currentUser.profile.name);
    if (!newName) return;

    const cleanName = newName.trim();
    if (!cleanName) return;

    const users = getUsers();

    const alreadyExists = users.some(
        user =>
            user.id !== currentUser.id &&
            user.profile.name.toLowerCase() === cleanName.toLowerCase()
    );

    if (alreadyExists) {
        alert("Ya existe un perfil con ese nombre.");
        return;
    }

    currentUser.profile.name = cleanName;

    saveCurrentUser();
    updateProfileUI();
});

// --- Search / filter ---
searchInp.addEventListener("input", filterAn);

filterCat.addEventListener("change", (event) => {
    searchInp.value = "";
    refreshProducts();

    switch (filterCat.value) {
        case "name":
            searchInp.type = "text";
            searchInp.placeholder = "Nombre del producto...";
            break;
        case "maxPrice":
            searchInp.type = "number";
            searchInp.placeholder = "Precio máximo del producto...";
            break;
        case "minPrice":
            searchInp.type = "number";
            searchInp.placeholder = "Precio mínimo del producto...";
            break;
        case "quantity":
            searchInp.type = "number";
            searchInp.placeholder = "Ingresa un apróximado ...";
            break;
    }
});

// --- Product list clicks (bill / changePrice / delete accumulation) ---
allProducts.addEventListener("click", (event) => {
    accumulateActions(act, event);
    console.log("product!");
    console.log(act);
});

// --- Categories view ---
productsBt.addEventListener("click", () => {
    // Volver a "todos los productos", sin categoría seleccionada
    openCategory(null, null);
});

categoriesBt.addEventListener("click", showCategoriesView);

newCategoryBt.addEventListener("click", createCategory);

categoryTree.addEventListener("click", (event) => {
    const button = event.target.closest("button");
    if (!button) return;

    const card = button.closest(".categoryCard");
    const categoryId = card ? card.dataset.categoryId : null;

    if (button.dataset.openCat) {
        openCategory(button.dataset.openCat, null);
        return;
    }
    if (button.dataset.openSub) {
        openCategory(categoryId, button.dataset.openSub);
        return;
    }
    if (button.dataset.addSub) {
        createSubcategory(button.dataset.addSub);
        return;
    }
    if (button.dataset.renameCat) {
        renameCategory(button.dataset.renameCat);
        return;
    }
    if (button.dataset.deleteCat) {
        deleteCategory(button.dataset.deleteCat);
        return;
    }
    if (button.dataset.renameSub) {
        renameSubcategory(categoryId, button.dataset.renameSub);
        return;
    }
    if (button.dataset.deleteSub) {
        deleteSubcategory(categoryId, button.dataset.deleteSub);
    }
});

// --- Breadcrumb ---
breadcrumb.addEventListener("click", (event) => {
    const button = event.target.closest(".crumb");
    if (!button || button.classList.contains("current")) return;

    if (button.dataset.crumb === "all") {
        openCategory(null, null);
        return;
    }

    if (button.dataset.crumb === "category") {
        openCategory(currentCategoryId, null);
    }
});

// --- Accumulate panel buttons ---
deleteProduct.addEventListener("click", () => {
    myList = [];
    act = "delete";

    accConfirmBt.classList.add("hidden");

    accModalContent.innerHTML = `
        <span class="noProductsYet">
            Aún no hay productos, haz click en ellos para eliminarlos
        </span>
    `;

    accumulatePanel.classList.remove("hidden");
    accumulatePanel.classList.remove("closing");
    accumulatePanel.classList.add("show");
});

changePrice.addEventListener("click", () => {
    myList = [];
    act = "changePrice";

    accConfirmBt.classList.add("hidden");

    accModalContent.innerHTML = `
        <span>
            Aún no hay productos, haz click en ellos para añadirlos
        </span>
    `;

    accumulatePanel.classList.remove("hidden");
    accumulatePanel.classList.remove("closing");
    accumulatePanel.classList.add("show");
});

accCancelBt.addEventListener("click", cancelCurrentAction);
accConfirmBt.addEventListener("click", confirmButton);

// --- Inventory action buttons (restock / add product / history) ---
restock.addEventListener("click", () => {
    // Si estamos dentro de una categoría, el Restock trabaja sobre esos productos
    if (getVisibleProducts().length === 0) {
        alert("No hay productos para reabastecer aquí.");
        return;
    }

    act = "restock";
    myInventaryActions('restock');
});

addProduct.addEventListener("click", () => {
    act = "addProduct";
    myInventaryActions('addProduct');
});

historyBt.addEventListener("click", () => {
    act = "history";
    myInventaryActions('history');
});

// --- Welcome / landing (Creatussiness) ---
welcomeGetStartedBt.addEventListener("click", enterApp);
welcomeMakeItYoursBt.addEventListener("click", enterApp);
welcomeFinalCtaBt.addEventListener("click", enterApp);

welcomeLearnBt.addEventListener("click", () => {
    aboutSection.scrollIntoView({ behavior: "smooth", block: "start" });
});

welcomeOriginBt.addEventListener("click", () => {
    originSection.scrollIntoView({ behavior: "smooth", block: "start" });
});

// Volver a la Welcome page desde dentro de la app, sin cerrar
// sesión ni tocar el flag de "ya vista": al presionar de nuevo
// "Get started" / "Create your profile", enterApp() te regresa
// exactamente a donde estabas (perfil y productos siguen en memoria).
backToWelcomeBt.addEventListener("click", showWelcomeOnly);


/* ============================================================
   15. APP INITIALIZATION
   Must run LAST — everything above (DOM refs, functions,
   listeners) needs to exist before this fires.
   ============================================================ */

overlay.classList.add("hidden");

// La app se prepara igual que siempre en segundo plano (perfiles,
// último usuario, etc.); lo único que decide si se ve ahora mismo
// o después de la Welcome page es este flag.
initializeProfiles();

if (localStorage.getItem(WELCOME_SEEN_KEY) === "true") {
    enterApp();
} else {
    showWelcomeOnly();
}
