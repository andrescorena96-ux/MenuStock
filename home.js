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

// Barra flotante de acciones (productos marcados)
const selectionBar = document.getElementById("selectionBar");
const selectionCount = document.getElementById("selectionCount");
const selEditBt = document.getElementById("selEditBt");
const selPriceBt = document.getElementById("selPriceBt");
const selDeleteBt = document.getElementById("selDeleteBt");
const selCancelBt = document.getElementById("selCancelBt");

const mainEl = document.querySelector(".main");

// Bienvenida / landing (MenúStock)
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
const accCancelBt = document.getElementById("accumulateCancelBt");
const accConfirmBt = document.getElementById("accumulateConfirmBt");
const alternativeCont = document.getElementById("alternativeCont");

// Sistema de diálogos (propio, reemplaza a prompt/alert/confirm nativos)
const dialogRoot = document.getElementById("dialogRoot");
const dialogTitle = document.getElementById("dialogTitle");
const dialogBody = document.getElementById("dialogBody");
const dialogActions = document.getElementById("dialogActions");
const dialogBackdrop = document.getElementById("dialogBackdrop");

// Compras a proveedores
const purchasesBt = document.getElementById("purchasesBt");
const suppliersBt = document.getElementById("suppliersBt");
const orderReorderBt = document.getElementById("orderReorderBt");
const purchasesView = document.getElementById("purchasesView");
const purchasesList = document.getElementById("purchasesList");
const newPurchaseBt = document.getElementById("newPurchaseBt");

// Exportar / importar datos
const exportDataBt = document.getElementById("exportDataBt");
const importDataBt = document.getElementById("importDataBt");
const importFileInput = document.getElementById("importFileInput");


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
let proveedores = [];    // [{ id, name, phone, note }]
let purchases = [];      // compras a proveedores: [{ id, fecha, proveedor, items, total, anulada }]
let clothingConfig = null; // { sizeSystem, sizeList } — solo si storeType === "clothing"

let currentCategoryId = null;      // null = todos los productos
let currentSubcategoryId = null;

let bill = 0;
let myList = [];
let act = "bill";

// Contador monótono para numerar los renglones de la cuenta.
// Antes se usaba myList.length + 1, que repetía números cuando
// se borraba un renglón del medio.
let billOrderCounter = 0;


/* ============================================================
   1b. UTILIDADES DE TEXTO Y URL
   Los nombres de productos, categorías y perfiles los escribe el
   usuario. Si se inyectan con innerHTML sin escapar, un nombre como
   `<img src=x onerror=...>` se ejecuta. Estos helpers neutralizan
   el HTML antes de meterlo en el DOM.
   ============================================================ */

function escapeHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

// Solo se permiten URLs de imagen razonables. Bloquea javascript:,
// data:text/html y cualquier esquema raro que pudiera ejecutarse.
function safeImageUrl(url) {
    const raw = String(url ?? "").trim();
    if (/^https?:\/\//i.test(raw)) return raw;
    if (/^data:image\/(png|jpe?g|gif|webp|svg\+xml);/i.test(raw)) return raw;
    return "";
}

// Imagen de relleno cuando el producto no tiene una válida.
const PLACEHOLDER_IMAGE =
    "https://i0.wp.com/tinasbotanicals.com/wp-content/uploads/2025/01/No-Product-Image-Available.png?fit=800%2C800&ssl=1";


/* ============================================================
   1c. SISTEMA DE DIÁLOGOS
   Reemplaza a prompt(), alert() y confirm() nativos: los nativos
   bloquean la pantalla, no admiten formato y rompen el diseño.
   Estos son promesas, así que se usan con `await`.
   ============================================================ */

let dialogResolve = null;

function closeDialog(result) {
    dialogRoot.classList.add("hidden");

    const resolve = dialogResolve;
    dialogResolve = null;

    if (resolve) resolve(result);
}

function openDialog({ title = "", bodyHtml = "", actions = [], onOpen = null, wide = false } = {}) {
    dialogRoot.classList.remove("hidden");

    dialogTitle.textContent = title;
    dialogBody.innerHTML = bodyHtml;
    dialogActions.innerHTML = "";

    dialogRoot.querySelector(".dialogPanel").classList.toggle("wide", !!wide);

    for (const action of actions) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = action.variant === "danger" ? "confirmBt danger"
            : action.variant === "cancel" ? "cancelBt"
            : action.variant === "ghost" ? "ghostBt"
            : "confirmBt";
        button.textContent = action.label;

        button.addEventListener("click", async () => {
            let result = action.value !== undefined ? action.value : null;

            if (action.onClick) {
                result = await action.onClick(dialogBody);
                // Un onClick que devuelve false deja el diálogo abierto.
                if (result === false) return;
            }

            closeDialog(result);
        });

        dialogActions.appendChild(button);
    }

    if (onOpen) onOpen(dialogBody);
}

// Convierte saltos de línea en <br> sin dejar pasar HTML.
function formatDialogMessage(message) {
    return escapeHtml(message).replace(/\n/g, "<br>");
}

// Aviso simple. Acepta \n para separar párrafos.
// extraActions permite ofrecer botones aparte del de "Entendido".
function showAlert({ title = "Aviso", message = "", extraActions = [] } = {}) {
    return new Promise(resolve => {
        dialogResolve = resolve;
        openDialog({
            title,
            bodyHtml: `<p>${formatDialogMessage(message)}</p>`,
            actions: [
                ...extraActions.map(action => ({
                    label: action.label,
                    variant: "ghost",
                    value: action.value,
                    onClick: async (body) => {
                        if (action.onClick) await action.onClick(body);
                        return action.value;
                    }
                })),
                { label: "Entendido", value: true }
            ]
        });
    });
}

// Confirmación. Resuelve true/false.
function showConfirm({
    title = "¿Confirmas?",
    message = "",
    confirmLabel = "Aceptar",
    cancelLabel = "Cancelar",
    danger = false
} = {}) {
    return new Promise(resolve => {
        dialogResolve = resolve;
        openDialog({
            title,
            bodyHtml: `<p>${formatDialogMessage(message)}</p>`,
            actions: [
                { label: cancelLabel, variant: "cancel", value: false },
                { label: confirmLabel, variant: danger ? "danger" : "confirm", value: true }
            ]
        });
    });
}

// Pedir un dato. Resuelve el texto (string) o null si se cancela.
// `validate` recibe el texto y devuelve un mensaje de error, o null si está bien.
function showPrompt({
    title = "",
    label = "",
    value = "",
    placeholder = "",
    hint = "",
    confirmLabel = "Aceptar",
    cancelLabel = "Cancelar",
    type = "text",
    validate = null
} = {}) {
    return new Promise(resolve => {
        dialogResolve = resolve;
        openDialog({
            title,
            bodyHtml: `
                ${label ? `<label class="dialogLabel" for="dialogInput">${escapeHtml(label)}</label>` : ""}
                <input id="dialogInput" class="dialogInput" type="${type}"
                       value="${escapeHtml(value)}" placeholder="${escapeHtml(placeholder)}" autocomplete="off">
                ${hint ? `<p class="dialogHint">${escapeHtml(hint)}</p>` : ""}
                <p id="dialogError" class="dialogError"></p>
            `,
            actions: [
                { label: cancelLabel, variant: "cancel", value: null },
                {
                    label: confirmLabel,
                    onClick: (body) => {
                        const input = body.querySelector("#dialogInput");
                        const entered = input.value.trim();

                        if (validate) {
                            const error = validate(entered);
                            if (error) {
                                body.querySelector("#dialogError").textContent = error;
                                input.focus();
                                input.select();
                                return false;
                            }
                        }

                        return entered;
                    }
                }
            ],
            onOpen: (body) => {
                const input = body.querySelector("#dialogInput");

                input.addEventListener("keydown", (event) => {
                    if (event.key === "Enter") {
                        event.preventDefault();
                        const buttons = dialogActions.querySelectorAll("button");
                        buttons[buttons.length - 1].click();
                    }
                });

                input.focus();
                input.select();
            }
        });
    });
}

// Diálogo informativo con contenido libre.
function showInfo({ title = "", bodyHtml = "" } = {}) {
    return new Promise(resolve => {
        dialogResolve = resolve;
        openDialog({
            title,
            bodyHtml,
            actions: [{ label: "Cerrar", variant: "cancel", value: true }]
        });
    });
}

// Cerrar con Escape o haciendo clic fuera del panel.
dialogBackdrop.addEventListener("click", () => {
    const cancelBtn = dialogActions.querySelector(".cancelBt");
    if (cancelBtn) cancelBtn.click();
});

document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;

    // 1) Si hay un diálogo abierto, sale el diálogo.
    if (!dialogRoot.classList.contains("hidden")) {
        const cancelBtn = dialogActions.querySelector(".cancelBt");
        if (cancelBtn) cancelBtn.click();
        return;
    }

});

const USERS_KEY = "menuStockUsers";
const CURRENT_USER_KEY = "menuStockCurrentUser";
const WELCOME_SEEN_KEY = "menuStockWelcomeSeen";

// Claves de versiones anteriores de la app. Se leen una sola vez
// para migrar los datos y luego se eliminan.
const USERS_KEY_LEGACY = "inventoryUsers";
const CURRENT_USER_KEY_LEGACY = "currentInventoryUser";
const WELCOME_SEEN_KEY_LEGACY = "creatussinessWelcomeSeen";

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

// Producto que se está editando en el formulario. null = alta nueva.
let editingProduct = null;

// Unidades de medida disponibles para un producto
const UNITS = [
    { id: "und",  label: "Unidades (und)" },
    { id: "kg",   label: "Kilogramos (kg)" },
    { id: "g",    label: "Gramos (g)" },
    { id: "L",    label: "Litros (L)" },
    { id: "ml",   label: "Mililitros (ml)" },
    { id: "caja", label: "Cajas" },
    { id: "paq",  label: "Paquetes" }
];

// Etiqueta corta de la unidad de un producto
function unitLabel(product) {
    const id = product && product.unit ? product.unit : "und";
    const found = UNITS.find(u => u.id === id);
    return found ? found.id : "und";
}

/**
 * Nivel de alerta del stock de un producto.
 *
 *   ok      -> hay stock de sobra           (verde)
 *   reorden -> toca reponer pronto         (amarillo)
 *   critico -> llegó al mínimo o se agotó  (rojo)
 *
 * Los umbrales vienen del stock mínimo que puso el dueño:
 * crítico por debajo del mínimo, reorden hasta una vez y media el mínimo.
 */
function stockLevel(product, cantidadAlternativa = null) {
    const cantidad = cantidadAlternativa !== null
        ? cantidadAlternativa
        : (Number(product && product.quantity) || 0);
    const minimo = Number(product && product.minStock) || 0;

    if (cantidad <= 0) return "critico";
    if (minimo <= 0) return "ok";
    if (cantidad <= minimo) return "critico";
    if (cantidad <= minimo * 1.5) return "reorden";
    return "ok";
}

const STOCK_LEVELS = {
    ok:      { label: "En stock" },
    reorden: { label: "Por reponer" },
    critico: { label: "Crítico" }
};

// Productos que hay que reponer ya
function productsToReorder() {
    return products.filter(p => {
        const nivel = stockLevel(p);
        return nivel === "critico" || nivel === "reorden";
    });
}

// Cuánto sugerir en un pedido para dejar el producto por encima del mínimo
function suggestedOrderQuantity(product) {
    const minimo = Number(product.minStock) || 0;
    const actual = Number(product.quantity) || 0;
    if (minimo <= 0) return 1;
    return Math.max(1, Math.min(minimo * 2 - actual, minimo * 2));
}


/* ============================================================
   5f. RECETAS (ESCANDALLO) Y COSTOS
   Un producto puede ser un preparado: en vez de tener stock propio
   se arma con insumos del inventario. Al venderlo se descuentan
   los insumos y su stock se calcula a partir de ellos.
   ============================================================ */

// Cuánto cuesta un producto: si es receta, la suma de sus insumos
function costoDeProducto(product) {
    if (!product) return 0;

    if (product.esReceta && Array.isArray(product.ingredientes)) {
        return product.ingredientes.reduce((suma, ing) => {
            const insumo = products.find(p => p.id === ing.productId);
            if (!insumo) return suma;
            return suma + (Number(insumo.costoUnitario) || 0) * (Number(ing.cantidad) || 0);
        }, 0);
    }

    return Number(product.costoUnitario) || 0;
}

// Margen de ganancia en porcentaje (null si no hay precio de venta)
function margenDeProducto(product) {
    const precio = Number(product && product.price) || 0;
    if (precio <= 0) return null;

    const costo = costoDeProducto(product);
    return ((precio - costo) / precio) * 100;
}

// Stock real de un producto. En una receta se calcula con lo que
// hay de cada insumo: cuantas unidades se podrían preparar.
function stockDeProducto(product) {
    if (!product) return 0;

    if (!product.esReceta) return Number(product.quantity) || 0;

    const ingredientes = Array.isArray(product.ingredientes) ? product.ingredientes : [];
    if (ingredientes.length === 0) return 0;

    let unidades = Infinity;
    for (const ing of ingredientes) {
        const insumo = products.find(p => p.id === ing.productId);
        if (!insumo) return 0;

        const porIngrediente = (Number(insumo.quantity) || 0) / (Number(ing.cantidad) || 1);
        unidades = Math.min(unidades, porIngrediente);
    }

    return Number.isFinite(unidades) ? Math.floor(unidades) : 0;
}

// Descontar una venta. Si el producto es receta, se descuentan
// sus insumos; si no, se descuenta su propio stock.
function descontarPorVenta(product, cantidad) {
    if (!product.esReceta) {
        product.quantity -= cantidad;
        recordStockChange(product, "sale", -cantidad, `Venta · ${cantidad} u.`);
        return;
    }

    for (const ing of product.ingredientes || []) {
        const insumo = products.find(p => p.id === ing.productId);
        if (!insumo) continue;

        const total = (Number(ing.cantidad) || 0) * cantidad;
        insumo.quantity -= total;
        recordStockChange(insumo, "sale", -total, `Venta de ${product.name}`);
    }
}

// Texto listo para enviar por WhatsApp al proveedor
function pedidoEnTexto(proveedor, lista) {
    const lineas = lista.map(p => {
        const sugerido = suggestedOrderQuantity(p);
        const unidad = unitLabel(p);
        const minimo = Number(p.minStock) || 0;
        return `• ${p.name} — pido ${sugerido} ${unidad}` +
            (minimo > 0 ? ` (tengo ${p.quantity}, mínimo ${minimo})` : ` (tengo ${p.quantity})`);
    });

    const total = lista.reduce((suma, p) => suma + suggestedOrderQuantity(p), 0);

    return [
        `Pedido para ${proveedor.nombre}`,
        proveedor.telefono ? `Tel: ${proveedor.telefono}` : "",
        "",
        ...lineas,
        "",
        `Unidades en total: ${total}`
    ].filter(linea => linea !== undefined).join("\n");
}

function storeTypeInfo(storeTypeId) {
    return STORE_TYPES.find(type => type.id === storeTypeId) || STORE_TYPES[STORE_TYPES.length - 1];
}

// Máximo de movimientos guardados por perfil (evita que localStorage crezca sin límite)
const MAX_HISTORY = 1000;

// Opciones de empaque del Restock. "none" = sin conversión, unidades directas.
const PACK_OPTIONS = [
    { value: "1", label: "Unidad (x1)" },
    { value: "6", label: "Paquete de 6 (x6)" },
    { value: "12", label: "Caja (x12)" },
    { value: "24", label: "Caja (x24)" },
    { value: "none", label: "Ninguno (unidades directas)" }
];

const ACTION_LABELS = {
    created: "Producto creado",
    restock: "Reposición",
    adjustment: "Ajuste manual",
    sale: "Venta",
    deleted: "Producto eliminado",
    purchase: "Compra a proveedor",
    purchaseVoid: "Compra anulada",
    merma: "Merma"
};


/* ============================================================
   3. LOCALSTORAGE / USER PERSISTENCE
   ============================================================ */

// ----------------------------------------
// GET ALL USERS
// ----------------------------------------
function getUsers() {
    const savedUsers = localStorage.getItem(USERS_KEY);

    if (savedUsers) {
        return JSON.parse(savedUsers);
    }

    // Migración: los datos de las versiones anteriores de la app
    // vivían bajo otras claves. Se copian una vez y se borra la vieja.
    const legacyUsers = localStorage.getItem(USERS_KEY_LEGACY);
    if (legacyUsers) {
        localStorage.setItem(USERS_KEY, legacyUsers);
        localStorage.removeItem(USERS_KEY_LEGACY);
        return JSON.parse(legacyUsers);
    }

    return [];
}

// ----------------------------------------
// GET LAST USED USER
// ----------------------------------------
function getLastUserId() {
    const id = localStorage.getItem(CURRENT_USER_KEY);
    if (id) return id;

    const legacyId = localStorage.getItem(CURRENT_USER_KEY_LEGACY);
    if (legacyId) {
        localStorage.setItem(CURRENT_USER_KEY, legacyId);
        localStorage.removeItem(CURRENT_USER_KEY_LEGACY);
        return legacyId;
    }

    return null;
}

// ----------------------------------------
// ¿YA SE VIO LA PÁGINA DE BIENVENIDA?
// ----------------------------------------
function wasWelcomeSeen() {
    if (localStorage.getItem(WELCOME_SEEN_KEY) === "true") return true;

    const legacy = localStorage.getItem(WELCOME_SEEN_KEY_LEGACY) === "true";
    if (legacy) {
        localStorage.setItem(WELCOME_SEEN_KEY, "true");
        localStorage.removeItem(WELCOME_SEEN_KEY_LEGACY);
    }
    return legacy;
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
    currentUser.purchases = purchases;
    currentUser.proveedores = proveedores;

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
            categories: [],
            purchases: [],
            proveedores: []
        },
        {
            id: crypto.randomUUID(),
            profile: { name: "María" },
            password: null,
            storeType: "general",
            clothingConfig: null,
            products: [],
            restockPreferences: {},
            historial: [],
            stockHistory: [],
            categories: [],
            purchases: [],
            proveedores: []
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
   3e. BIENVENIDA / LANDING (MenúStock)
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

    if (users.length === 0) {
        profileList.innerHTML = `
            <p class="profileEmpty">
                Todavía no hay perfiles. Crea el primero para empezar a llevar
                el inventario de tu negocio.
            </p>
        `;
        return;
    }

    users.forEach(user => {
        const card = document.createElement("div");
        card.classList.add("profileCard");
        card.dataset.profileId = user.id;

        const firstLetter = user.profile.name.charAt(0).toUpperCase();
        const type = storeTypeInfo(user.storeType);
        const lockIcon = user.password ? " 🔒" : "";

        const negocio = profileBusiness(user);

        card.innerHTML = `
            <div class="profileAvatar" style="background:${profileColor(user)}">
                ${escapeHtml(firstLetter)}
            </div>
            <div class="profileInfo">
                <h3>${escapeHtml(user.profile.name)}${lockIcon}</h3>
                <span>${type.icon} ${escapeHtml(type.label)}</span>
                ${negocio ? `<span class="profileBusiness">${escapeHtml(negocio)}</span>` : ""}
            </div>
            <button class="profileSelect" type="button">
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
    localStorage.removeItem(CURRENT_USER_KEY_LEGACY);

    // Conectamos los datos del perfil.
    // Los guards evitan que un perfil guardado por una versión
    // anterior (sin alguno de estos campos) deje la variable en
    // undefined y reviente la app al usarla.
    products = Array.isArray(currentUser.products) ? currentUser.products : [];
    restockPreferences = (currentUser.restockPreferences && typeof currentUser.restockPreferences === "object")
        ? currentUser.restockPreferences
        : {};
    historial = Array.isArray(currentUser.historial) ? currentUser.historial : [];

    // COMPATIBILIDAD: perfiles creados antes de esta versión
    // no tienen historial de stock ni categorías.
    if (!Array.isArray(currentUser.stockHistory)) {
        currentUser.stockHistory = [];
    }
    if (!Array.isArray(currentUser.categories)) {
        currentUser.categories = [];
    }
    if (!Array.isArray(currentUser.purchases)) {
        currentUser.purchases = [];
    }
    // Perfiles creados antes de MenúStock no tienen tipo de negocio.
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
    purchases = Array.isArray(currentUser.purchases) ? currentUser.purchases : [];
    proveedores = Array.isArray(currentUser.proveedores) ? currentUser.proveedores : [];

    // Los productos viejos simplemente quedan sin categoría.
    for (let product of products) {
        if (!("category" in product)) product.category = null;
        if (!("subcategory" in product)) product.subcategory = null;
        if (!("minStock" in product)) product.minStock = 0;
        if (!("unit" in product)) product.unit = "und";
        if (!("costoUnitario" in product)) product.costoUnitario = 0;
        if (!("proveedorId" in product)) product.proveedorId = null;
        if (!("esReceta" in product)) product.esReceta = false;
        if (!("ingredientes" in product)) product.ingredientes = [];
    }

    console.info("Perfil seleccionado:", currentUser.profile.name);

    hideProfiles();


    // Cada perfil entra viendo todos sus productos
    currentCategoryId = null;
    currentSubcategoryId = null;
    showProductsView();

    updateProfileUI();
}

/* ============================================================
   4c. FORMULARIO DE NUEVO PERFIL
   Antes se pedía el nombre y la contraseña en dos diálogos
   sueltos, y la contraseña era obligatoria. Ahora es un
   formulario: nombre, nombre del negocio, color y contraseña
   opcional.
   ============================================================ */

const PROFILE_COLORS = [
    { id: "oxblood",  color: "#5c1622" },
    { id: "rust",     color: "#b6502f" },
    { id: "marigold", color: "#d68a34" },
    { id: "olive",    color: "#5b7a5e" },
    { id: "blue",     color: "#4a6d8c" },
    { id: "plum",     color: "#7a4a63" },
    { id: "brown",    color: "#7a5c42" },
    { id: "slate",    color: "#5f6672" }
];

// Color del perfil (los perfiles viejos no lo tienen: usan el primero)
function profileColor(user) {
    const id = user && user.profile ? user.profile.color : null;
    const found = PROFILE_COLORS.find(c => c.id === id);
    return found ? found.color : PROFILE_COLORS[0].color;
}

// Nombre del negocio (opcional)
function profileBusiness(user) {
    return (user && user.profile && user.profile.business) ? user.profile.business : "";
}

function showProfileForm() {
    return new Promise(resolve => {
        dialogResolve = resolve;

        openDialog({
            title: "Nuevo perfil",
            wide: true,
            bodyHtml: `
                <div class="profileForm">

                    <div class="profileFormRow">
                        <span class="profileFormLabel">Color del perfil</span>
                        <div class="colorPicker" role="radiogroup" aria-label="Color del perfil">
                            ${PROFILE_COLORS.map((c, i) => `
                                <button type="button"
                                        class="colorSwatch${i === 0 ? " selected" : ""}"
                                        role="radio" aria-checked="${i === 0}"
                                        data-color="${c.id}" aria-label="Color ${c.id}"
                                        style="background:${c.color}"></button>
                            `).join("")}
                        </div>
                    </div>

                    <div class="profileFormRow">
                        <label class="profileFormLabel" for="profileNameInput">Nombre del perfil</label>
                        <input id="profileNameInput" class="dialogInput" type="text"
                               placeholder="Ej: Mi Tienda del barrio" autocomplete="off">
                    </div>

                    <div class="profileFormRow">
                        <label class="profileFormLabel" for="profileBusinessInput">
                            Nombre del negocio (opcional)
                        </label>
                        <input id="profileBusinessInput" class="dialogInput" type="text"
                               placeholder="Ej: Bodega Don Pepe" autocomplete="off">
                    </div>

                    <div class="profileFormRow">
                        <label class="profileFormLabel" for="profilePasswordInput">
                            Contraseña (opcional)
                        </label>
                        <input id="profilePasswordInput" class="dialogInput" type="password"
                               placeholder="Déjala vacía para abrirlo sin contraseña"
                               autocomplete="new-password">
                        <p class="dialogHint">
                            Si la dejas vacía, el perfil se abre sin pedir contraseña.
                        </p>
                    </div>

                    <p id="profileFormError" class="dialogError"></p>
                </div>
            `,
            actions: [
                { label: "Cancelar", variant: "cancel", value: null },
                {
                    label: "Crear perfil",
                    onClick: (body) => {
                        const nombre = body.querySelector("#profileNameInput").value.trim();
                        const negocio = body.querySelector("#profileBusinessInput").value.trim();
                        const clave = body.querySelector("#profilePasswordInput").value.trim();
                        const swatch = body.querySelector(".colorSwatch.selected");

                        if (!nombre) {
                            body.querySelector("#profileFormError").textContent =
                                "El perfil necesita un nombre.";
                            body.querySelector("#profileNameInput").focus();
                            return false;
                        }

                        return {
                            name: nombre,
                            business: negocio,
                            password: clave || null,
                            color: swatch ? swatch.dataset.color : PROFILE_COLORS[0].id
                        };
                    }
                }
            ],
            onOpen: (body) => {
                body.querySelectorAll(".colorSwatch").forEach(swatch => {
                    swatch.addEventListener("click", () => {
                        body.querySelectorAll(".colorSwatch").forEach(s => {
                            s.classList.remove("selected");
                            s.setAttribute("aria-checked", "false");
                        });
                        swatch.classList.add("selected");
                        swatch.setAttribute("aria-checked", "true");
                    });
                });

                const input = body.querySelector("#profileNameInput");
                input.addEventListener("keydown", (event) => {
                    if (event.key === "Enter") {
                        event.preventDefault();
                        const buttons = dialogActions.querySelectorAll("button");
                        buttons[buttons.length - 1].click();
                    }
                });

                input.focus();
            }
        });
    });
}


/* ============================================================
   4d. FLUJO DE CREACIÓN DE PERFIL
   La pantalla de perfiles y los modales se solapaban: el modal
   "qué tipo de negocio" se abría DETRÁS de la lista de perfiles
   y los clics no llegaban a él. Ahora la pantalla de perfiles se
   oculta mientras el flujo está abierto y vuelve al terminar
   (o al cancelar).
   ============================================================ */

// Abrir el flujo de creación de perfil
function openProfileCreation() {
    // Se oculta por completo: si no, las dos capas se superponen.
    profileSection.classList.add("hidden");

    selectedStoreType = null;
    selectedSizeSystem = null;
    pendingClothingConfig = null;

    act = "storeType";
    myInventaryActions('storeType');
}

/* ============================================================
   4e. CREAR PERFIL: paso final (los datos)
   Se llama después de elegir el tipo de negocio (y tallas,
   si es una tienda de ropa).
   ============================================================ */

async function finishProfileCreation() {
    const datos = await showProfileForm();

    if (!datos) {
        // El usuario canceló el formulario: se vuelve a la lista.
        resetPendingProfileState();
        showProfiles();
        return;
    }
    const users = getUsers();
    const alreadyExists = users.some(
        user => user.profile.name.toLowerCase() === datos.name.toLowerCase()
    );

    if (alreadyExists) {
        await showAlert({
            title: "Nombre en uso",
            message: `Ya existe un perfil con el nombre "${datos.name}".`
        });
        resetPendingProfileState();
        showProfiles();
        return;
    }

    const newUser = {
        id: crypto.randomUUID(),
        profile: {
            name: datos.name,
            business: datos.business,
            color: datos.color
        },
        password: datos.password,
        storeType: selectedStoreType,
        clothingConfig: selectedStoreType === "clothing" ? pendingClothingConfig : null,
        // NUEVO PERFIL = INVENTARIO VACÍO (con categorías sugeridas si es ropa)
        products: [],
        restockPreferences: {},
        historial: [],
        stockHistory: [],
        categories: selectedStoreType === "clothing" ? buildDefaultClothingCategories() : [],
        purchases: [],
        proveedores: []
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
    const lastUserId = getLastUserId();

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
    profileButtonAvatar.style.background = profileColor(currentUser);

    profileMenuName.textContent = name;
    profileMenuAvatar.textContent = firstLetter;
    profileMenuAvatar.style.background = profileColor(currentUser);
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
    // Se respeta la búsqueda activa. Antes se llamaba display() directo
    // y al guardar un producto se perdía el filtro que el usuario tenía
    // puesto, aunque el texto siguiera en el buscador.
    filterAn();
    updateSelection();
}

// ¿El producto se está viendo ahora mismo en la pantalla?
function productIsRendered(product) {
    return [...allProducts.querySelectorAll(".productCard")]
        .some(card => card.dataset.id === String(product.id));
}

// Explica por qué la lista está vacía, según el contexto.
function emptyListMessage() {
    const texto = searchInp.value.trim();

    if (texto !== "") {
        return `Ningún producto coincide con «${texto}».`;
    }
    if (currentCategoryId === "uncategorized") {
        return "No hay productos sin categoría.";
    }
    if (currentCategoryId !== null) {
        return `«${categoryName(currentCategoryId)}» todavía no tiene productos.`;
    }
    return "Todavía no hay productos registrados. Usa «Agregar producto» para empezar.";
}


/* ============================================================
   5e. MENÚ POR TARJETA Y SELECCIÓN MÚLTIPLE
   Cada tarjeta tiene su propio menú ⋮ con las acciones de ese
   producto. Para trabajar en varios a la vez se marcan con la
   casilla y aparece una barra flotante abajo.
   ============================================================ */

// Id de los productos marcados con la casilla
let selectedProductIds = new Set();

// Abre y cierra el menú ⋮ de una tarjeta
function closeCardMenus() {
    allProducts.querySelectorAll(".cardMenu").forEach(menu => { menu.hidden = true; });
    allProducts.querySelectorAll(".cardMenuBtn").forEach(btn => {
        btn.setAttribute("aria-expanded", "false");
    });
}

function toggleCardMenu(button) {
    const menu = button.parentElement.querySelector(".cardMenu");
    const estabaAbierto = menu && !menu.hidden;

    closeCardMenus();

    if (menu && !estabaAbierto) {
        menu.hidden = false;
        button.setAttribute("aria-expanded", "true");
    }
}

// Sincroniza las casillas, el resaltado de las tarjetas y la
// barra flotante.
function updateSelection() {
    const tarjetas = [...allProducts.querySelectorAll(".productCard")];
    const marcadas = new Set();

    for (const card of tarjetas) {
        const check = card.querySelector(".cardSelect");
        const marcado = !!check && check.checked;
        card.classList.toggle("selected", marcado);
        if (marcado) marcadas.add(String(card.dataset.id));
    }

    selectedProductIds = marcadas;

    const n = marcadas.size;
    selectionCount.textContent = n === 1
        ? "1 producto seleccionado"
        : `${n} productos seleccionados`;

    selectionBar.classList.toggle("hidden", n === 0);
    mainEl.classList.toggle("selectionOpen", n > 0);
}

function clearSelection() {
    allProducts.querySelectorAll(".cardSelect").forEach(check => { check.checked = false; });
    selectedProductIds = new Set();
    updateSelection();
}

function getSelectedProducts() {
    return products.filter(p => selectedProductIds.has(String(p.id)));
}

// --- Acciones sobre un solo producto (menú ⋮ de la tarjeta) ---

async function handleCardAction(action, card) {
    const product = products.find(p => String(p.id) === String(card.dataset.id));
    if (!product) return;

    if (action === "edit") {
        openProductEditor(product);
        return;
    }
    if (action === "price") {
        await changeProductPrice([product]);
        return;
    }
    if (action === "merma") {
        await registrarMerma(product);
        return;
    }
    if (action === "delete") {
        await deleteProducts([product]);
    }
}

// --- Acciones en bloque (varios productos marcados) ---

async function changeProductPrice(lista) {
    if (lista.length === 0) return;

    const nuevo = await showPrompt({
        title: lista.length === 1 ? "Cambiar precio" : `Cambiar precio de ${lista.length} productos`,
        label: lista.length === 1
            ? `Precio nuevo de "${lista[0].name}"`
            : "Precio nuevo para todos los productos marcados",
        value: lista.length === 1 ? lista[0].price : "",
        type: "number",
        validate: (value) => {
            const numero = Number(value);
            if (value === "" || !Number.isFinite(numero) || numero < 0) {
                return "Escribe un precio válido.";
            }
            return null;
        }
    });

    if (nuevo === null) return;

    const precio = Number(nuevo);
    for (const product of lista) {
        product.price = precio;
    }

    refreshProducts();
    updateSelection();
    saveCurrentUser();

    await showAlert({
        title: "Precio actualizado",
        message: lista.length === 1
            ? `«${lista[0].name}» ahora cuesta $${precio}.`
            : `${lista.length} productos ahora cuestan $${precio}.`
    });
}

async function deleteProducts(lista) {
    if (lista.length === 0) return;

    const nombres = lista.length <= 3
        ? lista.map(p => `• ${p.name}`).join("\n")
        : `• ${lista.slice(0, 3).map(p => p.name).join("\n")}\n… y ${lista.length - 3} más`;

    const confirmed = await showConfirm({
        title: lista.length === 1 ? "Eliminar producto" : `Eliminar ${lista.length} productos`,
        message:
            `¿Eliminar?\n\n${nombres}\n\n` +
            "El stock de estos productos queda registrado en el historial. " +
            "Esta acción no se puede deshacer.",
        confirmLabel: "Eliminar",
        danger: true
    });

    if (!confirmed) return;

    for (const product of lista) {
        // Queda constancia de cuánto stock se fue con el producto
        recordStockChange(product, "deleted", -product.quantity, "Producto eliminado");
        const index = products.findIndex(p => String(p.id) === String(product.id));
        if (index !== -1) products.splice(index, 1);
    }

    clearSelection();
    refreshProducts();
    saveCurrentUser();

    await showAlert({
        title: "Eliminado",
        message: lista.length === 1
            ? `Se eliminó «${lista[0].name}».`
            : `Se eliminaron ${lista.length} productos.`
    });
}

// Motivos habituales de merma
const MERMA_REASONS = [
    { id: "daño",      label: "Daño o rotura" },
    { id: "caducidad", label: "Caducidad" },
    { id: "preparación", label: "Error de preparación" },
    { id: "cocina",    label: "Merma de cocina" },
    { id: "otro",      label: "Otro" }
];

// Registrar una merma: el stock se pierde sin que haya venta.
async function registrarMerma(product) {
    const unidad = unitLabel(product);

    const datos = await new Promise(resolve => {
        dialogResolve = resolve;

        openDialog({
            title: "Registrar merma",
            bodyHtml: `
                <p class="dialogHint">
                    Se descuenta del inventario y queda registrado en el historial.
                    No cuenta como venta.
                </p>

                <div class="profileFormRow">
                    <label class="profileFormLabel" for="mermaQty">
                        Cantidad perdida (${escapeHtml(unidad)})
                    </label>
                    <input id="mermaQty" class="dialogInput" type="number" min="1"
                           step="1" placeholder="Ej: 3">
                    <p class="dialogHint">
                        Hay ${escapeHtml(product.quantity)} ${escapeHtml(unidad)} en stock.
                    </p>
                </div>

                <div class="profileFormRow">
                    <label class="profileFormLabel" for="mermaReason">Motivo</label>
                    <select id="mermaReason" class="dialogInput">
                        ${MERMA_REASONS.map(r => `
                            <option value="${r.id}">${r.label}</option>
                        `).join("")}
                    </select>
                </div>

                <p id="mermaError" class="dialogError"></p>
            `,
            actions: [
                { label: "Cancelar", variant: "cancel", value: null },
                {
                    label: "Registrar merma",
                    onClick: (body) => {
                        const cantidad = Number(body.querySelector("#mermaQty").value);
                        const motivoId = body.querySelector("#mermaReason").value;

                        if (!Number.isFinite(cantidad) || cantidad <= 0) {
                            body.querySelector("#mermaError").textContent =
                                "Escribe una cantidad mayor que cero.";
                            body.querySelector("#mermaQty").focus();
                            return false;
                        }

                        if (cantidad > product.quantity) {
                            body.querySelector("#mermaError").textContent =
                                `Solo hay ${product.quantity} ${unidad} en stock.`;
                            body.querySelector("#mermaQty").focus();
                            return false;
                        }

                        const motivo = MERMA_REASONS.find(r => r.id === motivoId);
                        return { cantidad, motivo: motivo ? motivo.label : "Merma" };
                    }
                }
            ],
            onOpen: (body) => {
                const input = body.querySelector("#mermaQty");
                input.addEventListener("keydown", (event) => {
                    if (event.key === "Enter") {
                        event.preventDefault();
                        const buttons = dialogActions.querySelectorAll("button");
                        buttons[buttons.length - 1].click();
                    }
                });
                input.focus();
            }
        });
    });

    if (!datos) return;

    product.quantity -= datos.cantidad;
    recordStockChange(product, "merma", -datos.cantidad, datos.motivo);

    refreshProducts();
    updateSelection();
    saveCurrentUser();

    await showAlert({
        title: "Merma registrada",
        message:
            `Se descontaron ${datos.cantidad} ${unidad} de «${product.name}» ` +
            `(${datos.motivo}). Quedan ${product.quantity}.`
    });
}

/* ============================================================
   5g. PROVEEDORES
   Un directorio por perfil. Cada producto puede apuntar a uno.
   Los productos que hay que reponer se agrupan por proveedor y
   sale un pedido en texto, listo para mandar por WhatsApp.
   ============================================================ */

function showSuppliersPanel() {
    const lista = proveedores.map(pv => `
        <div class="supplierRow" data-id="${escapeHtml(pv.id)}">
            <div class="supplierInfo">
                <strong>${escapeHtml(pv.name)}</strong>
                ${pv.phone ? `<span>${escapeHtml(pv.phone)}</span>` : ""}
                ${pv.note ? `<span class="supplierNote">${escapeHtml(pv.note)}</span>` : ""}
            </div>
            <div class="supplierActions">
                <button class="catBt" data-edit-supplier="${escapeHtml(pv.id)}" type="button">Renombrar</button>
                <button class="catBt danger" data-delete-supplier="${escapeHtml(pv.id)}" type="button">Eliminar</button>
            </div>
        </div>
    `).join("");

    openDialog({
        title: "Proveedores",
        wide: true,
        bodyHtml: `
            <div class="supplierList">
                ${lista || `
                    <p class="dialogHint">
                        Todavía no hay proveedores. Crea el primero para poder
                        asociar productos y generar pedidos.
                    </p>
                `}
            </div>
        `,
        actions: [
            { label: "Cerrar", variant: "cancel", value: null },
            { label: "+ Nuevo proveedor", value: "new" }
        ],
        onOpen: (body) => {
            body.querySelectorAll("[data-edit-supplier]").forEach(btn => {
                btn.addEventListener("click", async () => {
                    const pv = proveedores.find(x => x.id === btn.dataset.editSupplier);
                    if (!pv) return;

                    const nombre = await showPrompt({
                        title: "Renombrar proveedor",
                        label: "Nombre",
                        value: pv.name,
                        validate: (v) => v.length === 0 ? "El nombre no puede quedar vacío." : null
                    });
                    if (nombre === null) return;

                    pv.name = nombre.trim();
                    saveCurrentUser();
                    showSuppliersPanel();
                });
            });

            body.querySelectorAll("[data-delete-supplier]").forEach(btn => {
                btn.addEventListener("click", async () => {
                    const pv = proveedores.find(x => x.id === btn.dataset.deleteSupplier);
                    if (!pv) return;

                    const usados = products.filter(p => p.proveedorId === pv.id).length;

                    const confirmed = await showConfirm({
                        title: "Eliminar proveedor",
                        message:
                            `¿Eliminar a "${pv.name}"?` +
                            (usados > 0 ? `\n\n${usados} producto(s) quedarán sin proveedor.` : ""),
                        confirmLabel: "Eliminar",
                        danger: true
                    });
                    if (!confirmed) return;

                    proveedores = proveedores.filter(x => x.id !== pv.id);
                    products.forEach(p => {
                        if (p.proveedorId === pv.id) p.proveedorId = null;
                    });

                    saveCurrentUser();
                    showSuppliersPanel();
                });
            });
        }
    });

    // El botón "nuevo proveedor" es la última acción del diálogo.
    const botones = dialogActions.querySelectorAll("button");
    const nuevo = botones[botones.length - 1];
    nuevo.addEventListener("click", async () => {
        const nombre = await showPrompt({
            title: "Nuevo proveedor",
            label: "Nombre del proveedor",
            placeholder: "Ej: Distribuidora Don Pepe",
            validate: (v) => v.length === 0 ? "Escribe un nombre." : null
        });
        if (nombre === null) return;

        const telefono = await showPrompt({
            title: "Teléfono (opcional)",
            label: "Teléfono o WhatsApp",
            placeholder: "Ej: 300 123 4567"
        });

        proveedores.push({
            id: crypto.randomUUID(),
            name: nombre.trim(),
            phone: telefono ? telefono.trim() : "",
            note: ""
        });

        saveCurrentUser();
        closeDialog();
        showSuppliersPanel();
    });
}

// Genera el pedido de reposición, agrupado por proveedor
function showPedidoReorden() {
    const paraReponer = productsToReorder();

    if (paraReponer.length === 0) {
        showAlert({
            title: "Nada que pedir",
            message: "Ningún producto está por debajo de su stock mínimo."
        });
        return;
    }

    // Se agrupa por proveedor
    const porProveedor = new Map();
    const sinProveedor = [];

    for (const producto of paraReponer) {
        if (!producto.proveedorId) {
            sinProveedor.push(producto);
            continue;
        }
        if (!porProveedor.has(producto.proveedorId)) porProveedor.set(producto.proveedorId, []);
        porProveedor.get(producto.proveedorId).push(producto);
    }

    const secciones = [];

    for (const [proveedorId, lista] of porProveedor) {
        const pv = proveedores.find(p => p.id === proveedorId);
        const titulo = pv ? pv.nombre : "Proveedor desconocido";
        const texto = pv
            ? pedidoEnTexto(pv, lista)
            : pedidoEnTexto({ nombre: titulo, telefono: "" }, lista);

        secciones.push(`
            <div class="orderBlock">
                <div class="orderHead">
                    <strong>${escapeHtml(titulo)}</strong>
                    ${pv && pv.phone ? `<span>${escapeHtml(pv.phone)}</span>` : ""}
                </div>
                <pre class="orderText">${escapeHtml(texto)}</pre>
                <button class="catBt" data-copy-order="${escapeHtml(pv ? pv.id : "")}" type="button">
                    Copiar pedido
                </button>
            </div>
        `);
    }

    if (sinProveedor.length > 0) {
        const texto = pedidoEnTexto({ nombre: "Sin proveedor asignado", telefono: "" }, sinProveedor);
        secciones.push(`
            <div class="orderBlock">
                <div class="orderHead">
                    <strong>Sin proveedor asignado</strong>
                    <span>asigna un proveedor a estos productos</span>
                </div>
                <pre class="orderText">${escapeHtml(texto)}</pre>
                <button class="catBtn" data-copy-order="" type="button">Copiar pedido</button>
            </div>
        `);
    }

    openDialog({
        title: "Pedido de reposición",
        wide: true,
        bodyHtml: `
            <p class="dialogHint">
                Copia el pedido y mándalo por WhatsApp o email a cada proveedor.
            </p>
            ${secciones.join("")}
        `,
        actions: [{ label: "Cerrar", variant: "cancel", value: null }],
        onOpen: (body) => {
            body.querySelectorAll("[data-copy-order]").forEach(btn => {
                btn.addEventListener("click", async () => {
                    const pre = btn.parentElement.querySelector(".orderText");
                    const texto = pre.textContent;

                    try {
                        await navigator.clipboard.writeText(texto);
                        btn.textContent = "¡Copiado!";
                    } catch {
                        // Si el portapapeles no está disponible, se
                        // selecciona el texto para copiarlo a mano.
                        const rango = document.createRange();
                        rango.selectNodeContents(pre);
                        const seleccion = window.getSelection();
                        seleccion.removeAllRanges();
                        seleccion.addRange(rango);
                        btn.textContent = "Texto seleccionado";
                    }

                    setTimeout(() => { btn.textContent = "Copiar pedido"; }, 2000);
                });
            });
        }
    });
}

// Abrir el formulario de edición de un producto, con todos sus
// datos ya puestos (incluidos categoría y subcategoría).
function openProductEditor(product) {
    editingProduct = product;
    act = "editProduct";
    myInventaryActions('addProduct');
}

// La barra inferior solo se ve en la vista de productos.
// Mientras el panel de la cuenta está abierto (venta, cambio de precio
// o eliminación), ese panel ocupa su lugar: tiene sus propios botones
// de Aceptar y Cancelar.
function syncActionsBar() {
    const enProductos = categoriesView.classList.contains("hidden")
        && purchasesView.classList.contains("hidden");

    const panelAbierto = accumulatePanel.classList.contains("show");

    actionsBar.classList.toggle("hidden", !enProductos || panelAbierto);
}

// ----------------------------------------
// VISTAS
// ----------------------------------------
function setActiveNav(button) {
    productsBt.classList.toggle("active", button === "products");
    categoriesBt.classList.toggle("active", button === "categories");
    purchasesBt.classList.toggle("active", button === "purchases");
}

function showProductsView() {
    setActiveNav("products");
    categoriesView.classList.add("hidden");
    purchasesView.classList.add("hidden");

    searchPan.classList.remove("hidden");
    productsTitle.classList.remove("hidden");
    allProducts.classList.remove("hidden");

    renderBreadcrumb();
    refreshProducts();
    syncActionsBar();
}

function showCategoriesView() {
    // Al cambiar de vista se limpia la selección: las marcas pertenecen
    // a la lista que se estaba viendo.
    clearSelection();

    setActiveNav("categories");
    purchasesView.classList.add("hidden");
    searchPan.classList.add("hidden");
    productsTitle.classList.add("hidden");
    allProducts.classList.add("hidden");
    breadcrumb.classList.add("hidden");

    categoriesView.classList.remove("hidden");
    renderCategories();
    syncActionsBar();
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
        html += `<span class="crumb current">${escapeHtml(catName)}</span>`;
        productsTitle.textContent = catName;
    } else {
        const subName = subcategoryName(currentCategoryId, currentSubcategoryId);
        html += `
            <button class="crumb" data-crumb="category" type="button">${escapeHtml(catName)}</button>
            <span class="crumbSep">/</span>
            <span class="crumb current">${escapeHtml(subName)}</span>
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
                <button class="subName" data-open-sub="${escapeHtml(sub.id)}" type="button">${escapeHtml(sub.name)}</button>
                <span class="categoryCount">${countProductsIn(category.id, sub.id)}</span>
                <button class="catBt" data-rename-sub="${sub.id}" type="button">Renombrar</button>
                <button class="catBt danger" data-delete-sub="${sub.id}" type="button">Eliminar</button>
            </li>
        `).join("");

        card.innerHTML = `
            <div class="categoryCardHead">
                <button class="categoryName" data-open-cat="${escapeHtml(category.id)}" type="button">
                    ${escapeHtml(category.name)}
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
async function createCategory() {
    const name = await showPrompt({
        title: "Nueva categoría",
        label: "Nombre de la categoría",
        placeholder: "Ej: Bebidas",
        validate: (value) => {
            if (value.length === 0) return "Escribe un nombre para la categoría.";
            if (categories.some(cat => cat.name.toLowerCase() === value.toLowerCase())) {
                return "Ya existe una categoría con ese nombre.";
            }
            return null;
        }
    });

    if (name === null) return;

    categories.push({
        id: crypto.randomUUID(),
        name: name.trim(),
        subcategories: []
    });

    saveCurrentUser();
    renderCategories();
}

async function createSubcategory(categoryId) {
    const category = findCategory(categoryId);
    if (!category) return;

    const name = await showPrompt({
        title: `Nueva subcategoría en "${category.name}"`,
        label: "Nombre de la subcategoría",
        placeholder: "Ej: Gaseosas",
        validate: (value) => {
            if (value.length === 0) return "Escribe un nombre para la subcategoría.";
            if (category.subcategories.some(sub => sub.name.toLowerCase() === value.toLowerCase())) {
                return "Ya existe una subcategoría con ese nombre.";
            }
            return null;
        }
    });

    if (name === null) return;

    category.subcategories.push({
        id: crypto.randomUUID(),
        name: name.trim()
    });

    saveCurrentUser();
    renderCategories();
}

async function renameCategory(categoryId) {
    const category = findCategory(categoryId);
    if (!category) return;

    const newName = await showPrompt({
        title: "Renombrar categoría",
        label: "Nuevo nombre",
        value: category.name,
        validate: (value) => value.length === 0 ? "El nombre no puede quedar vacío." : null
    });

    if (newName === null) return;

    category.name = newName.trim();

    saveCurrentUser();
    renderCategories();
    renderBreadcrumb();
    refreshProducts();
}

async function renameSubcategory(categoryId, subcategoryId) {
    const sub = findSubcategory(categoryId, subcategoryId);
    if (!sub) return;

    const newName = await showPrompt({
        title: "Renombrar subcategoría",
        label: "Nuevo nombre",
        value: sub.name,
        validate: (value) => value.length === 0 ? "El nombre no puede quedar vacío." : null
    });

    if (newName === null) return;

    sub.name = newName.trim();

    saveCurrentUser();
    renderCategories();
    renderBreadcrumb();
    refreshProducts();
}

async function deleteCategory(categoryId) {
    const category = findCategory(categoryId);
    if (!category) return;

    const affected = countProductsIn(categoryId);

    const confirmed = await showConfirm({
        title: "Eliminar categoría",
        message:
            `¿Eliminar la categoría "${category.name}"?\n\n` +
            `Los ${affected} producto(s) que contiene NO se eliminan: quedan como "Sin categoría".`,
        confirmLabel: "Eliminar",
        danger: true
    });

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

async function deleteSubcategory(categoryId, subcategoryId) {
    const category = findCategory(categoryId);
    const sub = findSubcategory(categoryId, subcategoryId);
    if (!category || !sub) return;

    const affected = countProductsIn(categoryId, subcategoryId);

    const confirmed = await showConfirm({
        title: "Eliminar subcategoría",
        message:
            `¿Eliminar la subcategoría "${sub.name}"?\n\n` +
            `Los ${affected} producto(s) siguen en "${category.name}", sin subcategoría.`,
        confirmLabel: "Eliminar",
        danger: true
    });

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
   5c. COMPRAS A PROVEEDORES
   Registrar una compra suma el stock de los productos indicados.
   Es el lado "comprar" de la app: lo que entra al negocio desde
   afuera, además de lo que sale por venta.
   ============================================================ */

function showPurchasesView() {
    clearSelection();

    setActiveNav("purchases");

    searchPan.classList.add("hidden");
    productsTitle.classList.add("hidden");
    allProducts.classList.add("hidden");
    breadcrumb.classList.add("hidden");
    categoriesView.classList.add("hidden");

    purchasesView.classList.remove("hidden");
    renderPurchases();
    syncActionsBar();
}

function renderPurchases() {
    purchasesList.innerHTML = "";

    // Lista de reorden: lo que hay que comprar ya, con el mínimo
    // que dejó el dueño y la cantidad que se sugiere.
    const paraReponer = productsToReorder();

    if (paraReponer.length > 0) {
        const box = document.createElement("div");
        box.className = "reorderBox";
        box.innerHTML = `
            <div class="reorderHead">
                <h3>Necesitan reorden</h3>
                <span class="reorderCount">${paraReponer.length}</span>
            </div>

            <ul class="reorderList">
                ${paraReponer.map(p => `
                    <li>
                        <span class="reorderName">${escapeHtml(p.name)}</span>
                        <span class="reorderStock reorderStock--${stockLevel(p, stockDeProducto(p))}">
                            ${escapeHtml(stockDeProducto(p))} ${escapeHtml(unitLabel(p))}
                            ${Number(p.minStock) > 0 ? `· mínimo ${escapeHtml(p.minStock)}` : ""}
                        </span>
                    </li>
                `).join("")}
            </ul>

            <button id="generatePurchaseBt" class="newCategoryBt" type="button">
                + Generar compra con estos
            </button>
        `;

        purchasesList.appendChild(box);

        box.querySelector("#generatePurchaseBt").addEventListener("click", () => {
            act = "newPurchase";
            myInventaryActions("newPurchase", paraReponer);
        });
    }

    if (purchases.length === 0) {
        const vacio = document.createElement("p");
        vacio.className = "purchaseEmpty";
        vacio.innerHTML = `
            Todavía no hay compras registradas.<br>
            Cuando le compres a un proveedor, regístrala aquí para que
            el stock y el historial queden al día.
        `;
        purchasesList.appendChild(vacio);
        return;
    }

    for (const purchase of purchases) {
        const card = document.createElement("article");
        card.classList.add("purchaseCard");
        if (purchase.anulada) card.classList.add("void");

        const items = purchase.items.map(item => `
            <li class="purchaseItem">
                <span>${escapeHtml(item.nombre)}</span>
                <span class="qty">${item.cantidad} u.</span>
                <span>$${item.cantidad * item.precioUnitario}</span>
            </li>
        `).join("");

        card.innerHTML = `
            <div class="purchaseHead">
                <strong>${escapeHtml(purchase.proveedor)}</strong>
                <span class="purchaseDate">${escapeHtml(formatHistoryDate(purchase.fecha))}</span>
            </div>

            ${purchase.anulada ? `<span class="purchaseBadge">Anulada</span>` : ""}

            <ul class="purchaseItems">${items}</ul>

            <div class="purchaseFoot">
                <strong>Total</strong>
                <span>$${purchase.total}</span>
            </div>

            <div class="categoryCardActions">
                <button class="catBt" data-view-purchase="${escapeHtml(purchase.id)}" type="button">Ver detalle</button>
                ${purchase.anulada ? "" : `<button class="catBt danger" data-void-purchase="${escapeHtml(purchase.id)}" type="button">Anular</button>`}
            </div>
        `;

        purchasesList.appendChild(card);
    }
}

async function voidPurchase(purchaseId) {
    const purchase = purchases.find(p => p.id === purchaseId);
    if (!purchase || purchase.anulada) return;

    const confirmed = await showConfirm({
        title: "Anular compra",
        message:
            `¿Anular la compra a "${purchase.proveedor}" por $${purchase.total}?\n\n` +
            "El stock de esos productos se devuelve y queda registrado en el historial.",
        confirmLabel: "Anular compra",
        danger: true
    });

    if (!confirmed) return;

    purchase.anulada = true;

    for (const item of purchase.items) {
        const product = products.find(p => p.id === item.productId);
        if (!product) continue;

        product.quantity -= item.cantidad;
        recordStockChange(product, "purchaseVoid", -item.cantidad, `Compra anulada · ${item.cantidad} u.`);
    }

    saveCurrentUser();
    refreshProducts();
    renderPurchases();
}

function showPurchaseDetail(purchase) {
    const rows = purchase.items.map(item => `
        <li>
            ${escapeHtml(item.nombre)} — ${item.cantidad} u. × $${item.precioUnitario}
            = <strong>$${item.cantidad * item.precioUnitario}</strong>
        </li>
    `).join("");

    showInfo({
        title: `Compra a ${purchase.proveedor}`,
        bodyHtml: `
            <p>Fecha: ${escapeHtml(formatHistoryDate(purchase.fecha))}</p>
            <ul>${rows}</ul>
            <p><strong>Total: $${purchase.total}</strong></p>
            ${purchase.anulada ? `<p class="dialogHint">Esta compra está anulada: el stock ya fue devuelto.</p>` : ""}
        `
    });
}


/* ============================================================
   5d. EXPORTAR / IMPORTAR DATOS
   Todo vive en localStorage: si se borra el navegador del
   negocio, se pierde el inventario. Estos dos botones son el
   respaldo. La contraseña NO se exporta.
   ============================================================ */

function slugify(text) {
    return String(text)
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "") || "perfil";
}

function exportProfileData() {
    if (!currentUser) return;

    const payload = {
        app: "MenuStock",
        version: 1,
        exportedAt: new Date().toISOString(),
        profile: {
            name: currentUser.profile.name,
            storeType: currentUser.storeType,
            clothingConfig: currentUser.clothingConfig,
            products: currentUser.products,
            restockPreferences: currentUser.restockPreferences,
            historial: currentUser.historial,
            stockHistory: currentUser.stockHistory,
            categories: currentUser.categories,
            purchases: currentUser.purchases
            // La contraseña se deja fuera a propósito: es un secreto.
        }
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `menustock-${slugify(currentUser.profile.name)}-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
}

async function importProfileData(file) {
    if (!file || !currentUser) return;

    const text = await file.text();

    let data;
    try {
        data = JSON.parse(text);
    } catch {
        await showAlert({ title: "Archivo inválido", message: "El archivo no es un JSON válido." });
        return;
    }

    if (!data || !data.profile || !Array.isArray(data.profile.products)) {
        await showAlert({
            title: "Archivo inválido",
            message: "Este archivo no parece ser una exportación de MenúStock."
        });
        return;
    }

    const confirmed = await showConfirm({
        title: "Importar datos",
        message:
            `Se reemplazarán los datos del perfil "${currentUser.profile.name}" por los del archivo.\n\n` +
            "La contraseña NO se importa: se mantiene la actual.\n\n" +
            "¿Continuar?",
        confirmLabel: "Importar",
        danger: true
    });

    if (!confirmed) return;

    const incoming = data.profile;

    products = Array.isArray(incoming.products) ? incoming.products : [];
    restockPreferences = (incoming.restockPreferences && typeof incoming.restockPreferences === "object")
        ? incoming.restockPreferences
        : {};
    historial = Array.isArray(incoming.historial) ? incoming.historial : [];
    stockHistory = Array.isArray(incoming.stockHistory) ? incoming.stockHistory : [];
    categories = Array.isArray(incoming.categories) ? incoming.categories : [];
    purchases = Array.isArray(incoming.purchases) ? incoming.purchases : [];
    currentUser.clothingConfig = incoming.clothingConfig || null;

    currentCategoryId = null;
    currentSubcategoryId = null;

    saveCurrentUser();
    showProductsView();

    await showAlert({
        title: "Datos importados",
        message: `Se importaron los datos de "${incoming.name || currentUser.profile.name}".`
    });
}


/* ============================================================
   6. PRODUCT DISPLAY
   ============================================================ */

function display(prods) {
    allProducts.innerHTML = "";

    if (prods.length === 0) {
        allProducts.innerHTML = `
            <li class="productListEmpty">
                <span class="productListEmptyIcon" aria-hidden="true">📦</span>
                <p>${escapeHtml(emptyListMessage())}</p>
                ${searchInp.value.trim() === "" && currentCategoryId === null ? `
                    <button id="emptyAddProductBt" class="newCategoryBt" type="button">
                        + Agregar el primer producto
                    </button>
                ` : ""}
            </li>
        `;

        const btn = allProducts.querySelector("#emptyAddProductBt");
        if (btn) {
            btn.addEventListener("click", () => {
                editingProduct = null;
                act = "addProduct";
                myInventaryActions('addProduct');
            });
        }
        return;
    }

    for (let prod of prods) {
        const li = document.createElement("li");
        li.classList.add("productCard");
        li.id = prod.id;
        li.dataset.id = prod.id;

        // Imagen: solo se acepta una URL de imagen válida.
        const imageUrl = safeImageUrl(prod.image) || PLACEHOLDER_IMAGE;

        // Etiqueta de categoría (solo si el producto tiene una)
        let catLine = "";
        if (prod.category) {
            const subName = prod.subcategory ? subcategoryName(prod.category, prod.subcategory) : "";
            catLine = `<p class="productCat">${escapeHtml(categoryName(prod.category))}${subName ? " › " + escapeHtml(subName) : ""}</p>`;
        }

        // Resumen de tallas/colores (solo productos de ropa con variantes)
        let variantLine = "";
        if (Array.isArray(prod.variants) && prod.variants.length > 0) {
            const sizes = [...new Set(prod.variants.map(v => v.size))];
            const colors = [...new Set(prod.variants.map(v => v.color).filter(Boolean))];
            const sizesText = `Tallas: ${sizes.map(escapeHtml).join(", ")}`;
            const colorsText = colors.length > 0 ? ` · Colores: ${colors.map(escapeHtml).join(", ")}` : "";
            variantLine = `<p class="variantSummary">${sizesText}${colorsText}</p>`;
        }

        const esReceta = !!prod.esReceta;
        const unidad = unitLabel(prod);
        const minimo = Number(prod.minStock) || 0;

        // En una receta el stock se calcula con los insumos.
        const stock = stockDeProducto(prod);
        const nivel = stockLevel(prod, stock);
        const costo = costoDeProducto(prod);
        const margen = margenDeProducto(prod);

        const stockLine = nivel === "ok"
            ? `<p class="stockLine"><strong>Stock:</strong> ${escapeHtml(stock)} ${escapeHtml(unidad)}</p>`
            : `<p class="stockLine stockLine--${nivel}">
                   <span class="stockDot" aria-hidden="true"></span>
                   <strong>Stock:</strong> ${escapeHtml(stock)} ${escapeHtml(unidad)}
                   <span class="stockTag">${STOCK_LEVELS[nivel].label}</span>
                   ${minimo > 0 ? `<span class="stockMin">mínimo ${escapeHtml(minimo)}</span>` : ""}
               </p>`;

        // Costo y margen: solo tienen sentido con costo de compra
        const margenLine = (costo > 0 && margen !== null)
            ? `<p class="productMargin">
                   Costo ${escapeHtml(costo.toFixed(2))} ·
                   Margen <strong class="${margen >= 30 ? "marginGood" : margen >= 10 ? "marginMid" : "marginLow"}">${escapeHtml(margen.toFixed(0))}%</strong>
               </p>`
            : "";

        const recetaLine = esReceta
            ? `<p class="productCat">Receta · ${escapeHtml((prod.ingredientes || []).length)} insumos</p>`
            : "";

        li.innerHTML = `
            <input type="checkbox" class="cardSelect"
                   aria-label="Seleccionar ${escapeHtml(prod.name)}">

            <button type="button" class="cardMenuBtn"
                    aria-label="Acciones de ${escapeHtml(prod.name)}"
                    aria-haspopup="menu" aria-expanded="false">
                <span aria-hidden="true">⋯</span>
            </button>

            <div class="cardMenu" role="menu" hidden>
                <button type="button" class="cardMenuItem" data-card-action="edit" role="menuitem">
                    <span aria-hidden="true">✏️</span> Editar producto
                </button>
                <button type="button" class="cardMenuItem" data-card-action="price" role="menuitem">
                    <span aria-hidden="true">🏷️</span> Cambiar precio
                </button>
                <button type="button" class="cardMenuItem" data-card-action="merma" role="menuitem">
                    <span aria-hidden="true">📉</span> Registrar merma
                </button>
                <button type="button" class="cardMenuItem cardMenuItemDanger" data-card-action="delete" role="menuitem">
                    <span aria-hidden="true">🗑️</span> Eliminar producto
                </button>
            </div>

            <img class="pr" src="${escapeHtml(imageUrl)}" alt="${escapeHtml(prod.name)}" loading="lazy" decoding="async">
            <div class="productInfo">
                <h3>${escapeHtml(prod.name)}</h3>
                <p>$${escapeHtml(prod.price)}</p>
                ${stockLine}
                ${catLine}
                ${recetaLine}
                ${margenLine}
                ${variantLine}
            </div>
        `;

        // La tarjeta se hace clicable con el ratón; con rol de botón
        // y tabindex también se puede llegar con el teclado.
        li.setAttribute("role", "button");
        li.setAttribute("tabindex", "0");

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
    let base = getVisibleProducts();

    // Filtro por estado: en stock / stock bajo / agotado
    const estadoSel = document.getElementById("searchState");
    const estadoPedido = estadoSel ? estadoSel.value : "todos";
    if (estadoPedido !== "todos") {
        base = base.filter(prod => stockLevel(prod, stockDeProducto(prod)) === estadoPedido);
    }

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
            // .sort() sin comparador ordena como texto (100 antes que 20).
            filteredProducts = base
                .filter(prod => prod.price <= Number(text))
                .sort((a, b) => a.price - b.price);
            break;
        case "minPrice":
            searchInp.type = "number";
            searchInp.placeholder = "Precio mínimo del producto...";
            filteredProducts = base
                .filter(prod => prod.price >= Number(text))
                .sort((a, b) => a.price - b.price);
            break;
        case "quantity":
            searchInp.type = "number";
            searchInp.placeholder = "Ingresa un apróximado ...";
            filteredProducts = base
                .filter(prod => prod.quantity <= Number(text))
                .sort((a, b) => a.quantity - b.quantity);
            break;
    }

    display(filteredProducts);
}


/* ============================================================
   8. BILL / HISTORIAL HELPERS
   ============================================================ */

function updateBill() {
    // Cerrar el panel
    accumulatePanel.classList.remove("show");
    accumulatePanel.classList.add("closing");

    // Reiniciar el estado del acumulador
    bill = 0;
    myList = [];

    // MUY IMPORTANTE:
    // Al terminar o cancelar cualquier acción, se vuelve al modo cuenta.
    act = "bill";

    updateSelection();
    syncActionsBar();
}

function addToHistorial() {
    // Antes se guardaba `${myList}`, que produce "[object Object]".
    // Ahora se guarda la lista real de renglones vendidos.
    historial.push({
        id: crypto.randomUUID(),
        venta: myList.map(item => ({
            id: item.id,
            nombre: item.name,
            precio: Number(item.price),
            cantidad: item.quantity
        })),
        total: bill,
        fecha: new Date().toISOString()
    });
}


/* ============================================================
   9. MODAL HELPERS
   ============================================================ */

function closeModal() {
    overlay.classList.add("hidden");
    modali.classList.remove("show");
    modali.classList.add("closing");
    act = "bill";

    updateSelection();
    syncActionsBar();
}


/* ============================================================
   9b. LEER EL FORMULARIO DE PRODUCTO
   Sirve igual para el alta y para la edición: devuelve los datos
   del formulario, o un error si falta algo.
   ============================================================ */

function readProductForm() {
    const newName = document.getElementById("newName");
    const newPrice = document.getElementById("nprice");
    const newImg = document.getElementById("nimg");
    const newStock = document.getElementById("nstock");
    const newCategory = document.getElementById("ncategory");
    const newSubcategory = document.getElementById("nsubcategory");

    const name = newName.value.trim();
    const price = newPrice.valueAsNumber;

    if (name === "" || !Number.isFinite(price) || price < 0) {
        return { error: "El nombre y el precio son obligatorios." };
    }

    const minStockEl = document.getElementById("nminstock");
    const unitEl = document.getElementById("nunit");
    const costoEl = document.getElementById("ncosto");
    const proveedorEl = document.getElementById("nproveedor");
    const recetaEl = document.getElementById("nisreceta");

    const minStock = minStockEl ? Math.max(0, Number(minStockEl.value) || 0) : 0;
    const unit = unitEl && unitEl.value ? unitEl.value : "und";
    const costoUnitario = costoEl ? Math.max(0, Number(costoEl.value) || 0) : 0;
    const proveedorId = proveedorEl && proveedorEl.value ? proveedorEl.value : null;
    const esReceta = recetaEl ? recetaEl.checked : false;

    let ingredientes = [];
    if (esReceta) {
        ingredientes = [...modalcont.querySelectorAll(".recipeLine")]
            .map(row => ({
                productId: row.querySelector(".recipeProduct").value,
                cantidad: Number(row.querySelector(".recipeQty").value) || 0
            }))
            .filter(ing => ing.productId && ing.cantidad > 0);
    }

    const category = newCategory && newCategory.value ? newCategory.value : null;
    const subcategory = category && newSubcategory && newSubcategory.value
        ? newSubcategory.value
        : null;

    // ------------------------------------------------------
    // TIENDA DE ROPA: leer tallas/colores si el producto los usa
    // ------------------------------------------------------
    const isClothing = currentUser && currentUser.storeType === "clothing";
    let variants = null;
    let variantMode = null;

    if (isClothing) {
        const variantGrid = document.getElementById("variantModeGrid");
        const selectedBtn = variantGrid ? variantGrid.querySelector(".storeTypeOption.selected") : null;
        variantMode = selectedBtn ? selectedBtn.dataset.variantMode : "unique";

        if (variantMode === "sameAll") {
            const checked = [...document.querySelectorAll("#variantDetails .sizeCheck:checked")].map(c => c.value);
            const qtyInput = document.getElementById("sameAllQty");
            const qty = qtyInput ? qtyInput.valueAsNumber : NaN;

            if (checked.length === 0 || Number.isNaN(qty) || qty < 0) {
                return { error: "Elige al menos una talla y una cantidad válida." };
            }

            variants = checked.map(size => ({ size, color: null, quantity: qty }));

        } else if (variantMode === "perSize") {
            const rows = document.querySelectorAll("#perSizeQtyRows .sizeQtyRow");

            if (rows.length === 0) {
                return { error: "Elige al menos una talla." };
            }

            variants = [];
            for (const row of rows) {
                const size = row.dataset.size;
                const qty = row.querySelector(".perSizeQty").valueAsNumber;

                if (Number.isNaN(qty) || qty < 0) {
                    return { error: `Ingresa una cantidad válida para la talla ${size}.` };
                }
                variants.push({ size, color: null, quantity: qty });
            }

        } else if (variantMode === "colorSize") {
            const blocks = document.querySelectorAll("#colorBlocks .colorBlock");

            if (blocks.length === 0) {
                return { error: "Agrega al menos un color." };
            }

            variants = [];
            for (const block of blocks) {
                const colorName = block.querySelector(".colorNameInput").value.trim();

                if (!colorName) {
                    return { error: "Ponle nombre a cada color." };
                }

                const rows = block.querySelectorAll(".sizeQtyRow");
                if (rows.length === 0) {
                    return { error: `Elige al menos una talla para el color "${colorName}".` };
                }

                for (const row of rows) {
                    const size = row.dataset.size;
                    const qty = row.querySelector(".perSizeQty").valueAsNumber;

                    if (Number.isNaN(qty) || qty < 0) {
                        return { error: `Ingresa una cantidad válida para ${colorName} / ${size}.` };
                    }
                    variants.push({ size, color: colorName, quantity: qty });
                }
            }
        }
        // variantMode === "unique" -> variants queda null, se usa el stock normal
    }

    let stock = newStock.valueAsNumber;
    if (variants) {
        stock = variants.reduce((sum, v) => sum + v.quantity, 0);
    } else if (newStock.value.trim() === "" || Number.isNaN(stock)) {
        stock = 0;
    }

    const imageRaw = newImg.value.trim();
    const image = imageRaw ? (safeImageUrl(imageRaw) || PLACEHOLDER_IMAGE) : PLACEHOLDER_IMAGE;

    const clothing = { season: "", collection: "", series: "", supplier: "" };

    if (isClothing) {
        const season = document.getElementById("nseason");
        const collection = document.getElementById("ncollection");
        const series = document.getElementById("nseries");
        const supplier = document.getElementById("nsupplier");

        clothing.season = season ? season.value.trim() : "";
        clothing.collection = collection ? collection.value.trim() : "";
        clothing.series = series ? series.value.trim() : "";
        clothing.supplier = supplier ? supplier.value.trim() : "";
    }

    return {
        name, price, stock, image, category, subcategory,
        minStock, unit, costoUnitario, proveedorId, esReceta, ingredientes,
        variants, variantMode, isClothing, clothing
    };
}

// Deduce el modo de variante de un producto guardado antes de que
// existiera el campo variantMode.
function inferVariantMode(product) {
    if (!product || !Array.isArray(product.variants) || product.variants.length === 0) {
        return "unique";
    }
    if (product.variants.some(v => v.color)) return "colorSize";

    const cantidades = new Set(product.variants.map(v => v.quantity));
    return cantidades.size === 1 ? "sameAll" : "perSize";
}


/* ============================================================
   10. CONFIRM / CANCEL ACTIONS
   ============================================================ */

async function confirmButton() {
    // Los avisos de éxito se guardan aquí y se muestran DESPUÉS de
    // guardar, para que el dato quede en localStorage aunque el usuario
    // cierre la pestaña con el aviso en pantalla.
    let messageAfterSave = null;

    switch (act) {

        // =========================
        // TIPO DE NEGOCIO (nuevo perfil)
        // =========================
        case "storeType": {
            if (!selectedStoreType) {
                await showAlert({ title: "Falta elegir el tipo", message: "Elige un tipo de negocio para continuar." });
                return;
            }

            closeModal();

            if (selectedStoreType === "clothing") {
                // Falta configurar tallas antes de crear el perfil.
                act = "clothingSizeSystem";
                myInventaryActions("clothingSizeSystem");
                return;
            }

            await finishProfileCreation();
            return;
        }

        // =========================
        // TALLAS DE LA TIENDA DE ROPA (nuevo perfil)
        // =========================
        case "clothingSizeSystem": {
            if (!selectedSizeSystem) {
                await showAlert({ title: "Falta elegir el sistema", message: "Elige un sistema de tallas para continuar." });
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
                    await showAlert({ title: "Faltan tallas", message: "Escribe al menos una talla, separada por comas." });
                    return;
                }

                sizeList = raw.split(",").map(s => s.trim()).filter(Boolean);

                if (sizeList.length === 0) {
                    await showAlert({ title: "Faltan tallas", message: "Escribe al menos una talla válida." });
                    return;
                }
            }

            pendingClothingConfig = { sizeSystem: selectedSizeSystem, sizeList };

            closeModal();
            await finishProfileCreation();
            return;
        }

        // =========================
        // AGREGAR / EDITAR PRODUCTO
        // =========================
        case "addProduct":
        case "editProduct": {
            const data = readProductForm();

            if (data.error) {
                await showAlert({ title: "Faltan datos", message: data.error });
                return;
            }

            // ----------------------------------------
            // EDITAR UN PRODUCTO EXISTENTE
            // ----------------------------------------
            if (act === "editProduct") {
                const product = products.find(p => String(p.id) === String(editingProduct.id));

                if (!product) {
                    await showAlert({
                        title: "Producto no encontrado",
                        message: "El producto que querías editar ya no existe."
                    });
                    editingProduct = null;
                    closeModal();
                    return;
                }

                const cambios = [];

                if (product.name !== data.name) {
                    cambios.push("nombre");
                    product.name = data.name;
                }

                if (Number(product.price) !== Number(data.price)) {
                    cambios.push("precio");
                    product.price = data.price;
                }

                const imagenAntes = (product.image || "").trim();
                if (imagenAntes !== data.image) {
                    // Poner la imagen de relleno no es un cambio real.
                    const esSoloRelleno = imagenAntes === "" && data.image === PLACEHOLDER_IMAGE;
                    if (!esSoloRelleno) cambios.push("imagen");
                    product.image = data.image;
                }

                // Aquí es donde el producto cambia de categoría y subcategoría.
                if ((product.category || null) !== (data.category || null)) {
                    cambios.push("categoría");
                }
                if ((product.subcategory || null) !== (data.subcategory || null)) {
                    cambios.push("subcategoría");
                }

                product.category = data.category;
                product.subcategory = data.subcategory;
                product.minStock = data.minStock;
                product.unit = data.unit;
                product.costoUnitario = data.costoUnitario;
                product.proveedorId = data.proveedorId;
                product.esReceta = data.esReceta;
                product.ingredientes = data.esReceta ? data.ingredientes : [];

                if (data.isClothing) {
                    product.variants = data.variants;
                    product.variantMode = data.variantMode;
                    product.season = data.clothing.season;
                    product.collection = data.clothing.collection;
                    product.series = data.clothing.series;
                    product.supplier = data.clothing.supplier;
                }

                // Si se movió el stock, queda como ajuste en el historial:
                // ningún cambio de inventario pasa sin rastro.
                const delta = data.stock - product.quantity;
                product.quantity = data.stock;

                if (delta !== 0) {
                    cambios.push("stock");
                    recordStockChange(product, "adjustment", delta, "Ajuste al editar el producto");
                }

                refreshProducts();

                // Se sigue en modo edición para poder corregir varios seguidos.
                closeModal();
                act = "editProduct";
                editingProduct = null;

                messageAfterSave = {
                    title: "Producto actualizado",
                    message: cambios.length > 0
                        ? `Se actualizó "${data.name}". Cambios: ${cambios.join(", ")}.`
                        : `No hubo cambios en "${data.name}".`
                };

                // Si el producto se movió de categoría, deja de verse en la
                // vista actual. Sin avisar, el usuario cree que se borró.
                if (!productIsRendered(product)) {
                    if (product.category) {
                        const nombreCat = categoryName(product.category);
                        messageAfterSave.message += `\n\nAhora está en «${nombreCat}», que no se ve desde aquí.`;
                        messageAfterSave.extraActions = [{
                            label: `Ver en «${nombreCat}»`,
                            value: "goto"
                        }];
                        messageAfterSave.goto = () => openCategory(product.category, product.subcategory);
                    } else {
                        messageAfterSave.message += "\n\nAhora no tiene categoría.";
                    }
                }
                break;
            }

            // ----------------------------------------
            // DAR DE ALTA UN PRODUCTO NUEVO
            // ----------------------------------------
            // El id tiene que ser único de verdad. Antes era la inicial
            // del nombre más la hora: dos productos con la misma inicial
            // creados en el mismo milisegundo quedaban con el MISMO id
            // y las búsquedas por id devolvían el producto equivocado.
            const newId = `p-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;

            const createdProduct = {
                id: newId,
                name: data.name,
                price: data.price,
                quantity: data.stock,
                image: data.image,
                category: data.category,
                subcategory: data.subcategory,
                minStock: data.minStock,
                unit: data.unit,
                costoUnitario: data.costoUnitario,
                proveedorId: data.proveedorId,
                esReceta: data.esReceta,
                ingredientes: data.esReceta ? data.ingredientes : [],
                createdIn: new Date()
            };

            if (data.isClothing) {
                createdProduct.variants = data.variants;   // null si es "Artículo único"
                createdProduct.variantMode = data.variantMode;

                createdProduct.season = data.clothing.season;
                createdProduct.collection = data.clothing.collection;
                createdProduct.series = data.clothing.series;
                createdProduct.supplier = data.clothing.supplier;
            }

            products.push(createdProduct);

            // Primer movimiento del historial de este producto
            recordStockChange(
                createdProduct,
                "created",
                data.stock,
                data.variants ? "Tallas/colores iniciales" : "Stock inicial"
            );

            refreshProducts();
            closeModal();
            act = "bill";
            editingProduct = null;

            messageAfterSave = {
                title: "Producto agregado",
                message: `Se agregó "${data.name}" al inventario.`
            };

            // Si hay una búsqueda puesta y el producto nuevo no entra en
            // ella, se avisa: si no, parece que no se guardó nada.
            if (!productIsRendered(createdProduct) && searchInp.value.trim() !== "") {
                messageAfterSave.message +=
                    `\n\nNo se ve porque la búsqueda «${searchInp.value.trim()}» lo está filtrando.`;
            }
            break;
        }

        // =========================
        // NUEVA COMPRA A PROVEEDOR
        // =========================
        case "newPurchase": {
            const supplierInput = document.getElementById("purchaseSupplier");
            const supplier = supplierInput.value.trim();

            if (!supplier) {
                await showAlert({ title: "Falta el proveedor", message: "Escribe el nombre del proveedor." });
                supplierInput.focus();
                return;
            }

            const rows = [...modalcont.querySelectorAll(".purchaseLine[data-index]")];

            if (rows.length === 0) {
                await showAlert({ title: "Compra vacía", message: "Agrega al menos un producto a la compra." });
                return;
            }

            const items = rows.map(row => ({
                productId: row.querySelector(".purchaseProduct").value,
                cantidad: Number(row.querySelector(".purchaseQty").value),
                precioUnitario: Number(row.querySelector(".purchasePrice").value)
            }));

            const invalid = items.find(item =>
                !item.productId ||
                !Number.isFinite(item.cantidad) || item.cantidad <= 0 ||
                !Number.isFinite(item.precioUnitario) || item.precioUnitario < 0
            );

            if (invalid) {
                await showAlert({
                    title: "Datos incompletos",
                    message: "Revisa las cantidades y los precios de los productos de la compra."
                });
                return;
            }

            const detailedItems = items.map(item => {
                const product = products.find(p => p.id === item.productId);
                return {
                    productId: item.productId,
                    nombre: product ? product.name : "Producto eliminado",
                    cantidad: item.cantidad,
                    precioUnitario: item.precioUnitario
                };
            });

            const total = detailedItems.reduce(
                (sum, item) => sum + item.cantidad * item.precioUnitario, 0
            );

            purchases.unshift({
                id: crypto.randomUUID(),
                fecha: new Date().toISOString(),
                proveedor: supplier,
                items: detailedItems,
                total: total,
                anulada: false
            });

            // La compra suma stock a los productos.
            for (const item of detailedItems) {
                const product = products.find(p => p.id === item.productId);
                if (!product) continue;

                product.quantity += item.cantidad;
                recordStockChange(
                    product,
                    "purchase",
                    item.cantidad,
                    `Compra a ${supplier} · ${item.cantidad} u.`
                );
            }

            refreshProducts();
            closeModal();
            act = "bill";
            renderPurchases();

            messageAfterSave = {
                title: "Compra registrada",
                message: `Se registró la compra a ${supplier} por $${total}. El stock ya está actualizado.`
            };
            break;
        }

        // =========================
        // RESTOCK
        // =========================
        case "restock": {
            // Primero se validan TODAS las filas y solo después se aplica
            // nada. Antes se modificaba sobre la marcha: si una fila estaba
            // mal, las anteriores ya habían cambiado en memoria pero no se
            // guardaban, y la pantalla quedaba desincronizada.
            const parsedRows = [];
            let invalid = null;

            for (let product of getVisibleProducts()) {
                const packSelect = document.getElementById(`pack-${product.id}`);
                const qtyInput = document.getElementById(`inputRestock-${product.id}`);
                if (!packSelect || !qtyInput) continue;

                const parsed = parseRestockExpression(qtyInput.value, packSelect.value);

                // Campo vacío: este producto simplemente no se toca
                if (parsed.empty) continue;

                if (!parsed.ok) {
                    invalid = { product, qtyInput };
                    break;
                }

                if (parsed.units === 0) continue;

                parsedRows.push({ product, parsed, packSelect, qtyInput });
            }

            if (invalid) {
                await showAlert({
                    title: "Cantidad inválida",
                    message:
                        `La cantidad de "${invalid.product.name}" no es válida.\n\n` +
                        "Usa números con + y -, por ejemplo: 2 + 16, 10, -3."
                });
                invalid.qtyInput.focus();
                invalid.qtyInput.select();
                return;
            }

            if (parsedRows.length === 0) {
                await showAlert({
                    title: "Nada que guardar",
                    message: "Ingresa al menos una cantidad distinta de 0 para guardar."
                });
                return;
            }

            // Todo válido: ahora sí se aplica.
            for (const row of parsedRows) {
                const { product, parsed, packSelect, qtyInput } = row;

                product.quantity += parsed.units;

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

            refreshProducts();
            messageAfterSave = { title: "Listo", message: "Stock actualizado exitosamente." };
            closeModal();
            act = "bill";
            break;
        }

        // =========================
        // BILL
        // =========================
        case "bill": {
            if (myList.length === 0 || bill === 0) {
                await showAlert({ title: "Cuenta vacía", message: "No hay productos en la cuenta." });
                return;
            }

            // Se valida el stock ANTES de descontar. Antes se modificaba
            // primero y el aviso salía después, dejando el inventario
            // en negativo sin remedio.
            const shortages = [];
            for (let consume of myList) {
                const product = products.find(value => String(value.id) === String(consume.id));
                if (!product) continue;

                const missing = consume.quantity - stockDeProducto(product);
                if (missing > 0) {
                    shortages.push(
                        `• ${product.name}: faltan ${missing} u. (stock actual: ${product.quantity})`
                    );
                }
            }

            if (shortages.length > 0) {
                await showAlert({
                    title: "No hay stock suficiente",
                    message: "No hay stock suficiente para completar la venta:\n\n" + shortages.join("\n")
                });
                return;
            }

            for (let consume of myList) {
                const product = products.find(value => String(value.id) === String(consume.id));

                if (!product) {
                    console.error("Producto no encontrado:", consume.id);
                    continue;
                }

                // Si es una receta se descuentan sus insumos; si no, su
                // propio stock. En ambos casos queda en el historial.
                descontarPorVenta(product, consume.quantity);
            }

            // Guardar la venta ANTES de vaciar myList
            addToHistorial();
            messageAfterSave = { title: "Venta finalizada", message: `Venta finalizada. Total: $${bill}` };

            // Reiniciar todo
            bill = 0;
            myList = [];
            act = "bill";

            refreshProducts();

            accumulatePanel.classList.remove("show");
            accumulatePanel.classList.add("closing");
            break;
        }

    }

    saveCurrentUser();

    // Antes se llamaba display(products), que pintaba TODOS los productos
    // y borraba el filtro de categoría en el que estuviéramos.
    // refreshProducts() respeta la categoría activa.
    refreshProducts();

    updateSelection();
    syncActionsBar();

    if (messageAfterSave) {
        const resultado = await showAlert(messageAfterSave);

        // Botones extra del aviso (por ejemplo "Ver en «categoría»").
        if (resultado === "goto" && typeof messageAfterSave.goto === "function") {
            messageAfterSave.goto();
        }
    }
}

function cancelCurrentAction() {
    switch (act) {
        case 'storeType':
        case 'clothingSizeSystem': {
            selectedStoreType = null;
            selectedSizeSystem = null;
            pendingClothingConfig = null;
            closeModal();
            // Vuelve a la lista de perfiles: el flujo se abortó.
            showProfiles();
            break;
        }
        case 'addProduct':
        case 'editProduct': {
            editingProduct = null;
            closeModal();
            break;
        }
        case 'restock':
            closeModal();
            break;
        case 'newPurchase':
            closeModal();
            break;
        case 'history':
            closeModal();
            break;
        case 'bill':
            updateBill();
            break;
    }
}


/* ============================================================
   11. INVENTORY ACTION MODALS (add product / restock / history)
   ============================================================ */

function myInventaryActions(action, productosPrecargados = null) {
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
                        Esto ayuda a MenúStock a adaptar el inventario y la
                        reposición a cómo funciona tu negocio.
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
            const isEditing = !!editingProduct;

            // El formulario sirve para alta y para edición: la accion
            // depende de si hay un producto cargado.
            act = isEditing ? "editProduct" : "addProduct";

            // Si estamos dentro de una categoría, el producto nace ahí.
            // Al editar, manda la categoría que ya tiene el producto.
            const presetCategory = isEditing
                ? (editingProduct.category || null)
                : (currentCategoryId === "uncategorized" ? null : currentCategoryId);

            const presetSubcategory = isEditing
                ? (editingProduct.subcategory || null)
                : (presetCategory ? currentSubcategoryId : null);

            const categoryOptions = [`<option value="">Sin categoría</option>`]
                .concat(categories.map(cat => `
                    <option value="${escapeHtml(cat.id)}" ${cat.id === presetCategory ? "selected" : ""}>
                        ${escapeHtml(cat.name)}
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
                <div class="productFormModal">

                    <div class="productFormHeader">
                        <h3 id="modalTitle">${isEditing ? "Editar producto" : "¡Agrega un nuevo producto!"}</h3>
                        <p class="productFormSubtitle">
                            ${isEditing
                                ? "Cambia lo que necesites. Si mueves el stock, queda registrado en el historial como ajuste."
                                : "El nombre y el precio son obligatorios. El resto de los campos se puede completar más adelante."}
                        </p>
                    </div>

                    <div class="productFormGrid">
                        <input id="newName" type="text" placeholder="Nombra tu producto"
                               value="${isEditing ? escapeHtml(editingProduct.name) : ""}">
                        <input id="nprice" type="number" placeholder="Ingresa precio"
                               value="${isEditing ? escapeHtml(editingProduct.price) : ""}">
                        <input id="nimg" type="url" placeholder="Imagen URL"
                               value="${isEditing ? escapeHtml(editingProduct.image || "") : ""}">
                        <input id="nstock" type="number" placeholder="Stock inicial"
                               value="${isEditing ? escapeHtml(editingProduct.quantity) : ""}">
                        <select id="ncategory">${categoryOptions}</select>
                        <select id="nsubcategory"></select>
                        <input id="nminstock" type="number" min="0" placeholder="Stock mínimo (opcional)"
                               value="${isEditing ? escapeHtml(editingProduct.minStock || "") : ""}">
                        <select id="nunit">
                            ${UNITS.map(u => `
                                <option value="${u.id}" ${isEditing && editingProduct.unit === u.id ? "selected" : ""}>
                                    ${u.label}
                                </option>
                            `).join("")}
                        </select>
                        <input id="ncosto" type="number" min="0" step="0.01"
                               placeholder="Costo de compra (opcional)"
                               value="${isEditing ? escapeHtml(editingProduct.costoUnitario || "") : ""}">
                        <select id="nproveedor">
                            <option value="">Sin proveedor</option>
                            ${proveedores.map(pv => `
                                <option value="${escapeHtml(pv.id)}" ${isEditing && editingProduct.proveedorId === pv.id ? "selected" : ""}>
                                    ${escapeHtml(pv.name)}
                                </option>
                            `).join("")}
                        </select>
                    </div>

                    <!-- Escandallo: un preparado armado con insumos del inventario -->
                    <div class="recipeBlock">
                        <label class="recipeToggle">
                            <input type="checkbox" id="nisreceta"
                                   ${isEditing && editingProduct.esReceta ? "checked" : ""}>
                            <span>Es una receta (se prepara con insumos del inventario)</span>
                        </label>

                        <div id="recipeEditor" class="recipeEditor hidden">
                            <h4 class="clothingBlockTitle">Ingredientes de la receta</h4>
                            <div id="recipeLines"></div>
                            <button id="addRecipeLineBt" class="cancelBt" type="button">+ Agregar ingrediente</button>
                            <p class="recipeCost">
                                Costo del preparado: <strong id="recipeCostValue">$0</strong>
                            </p>
                            <p class="dialogHint">
                                Al vender este producto se descuentan los insumos
                                automáticamente. El stock sale de ellos.
                            </p>
                        </div>
                    </div>

                    ${clothingBlockHtml}

                    <div class="buttons">
                        <button id="inventaryCancelBt" class="cancelBt" type="button">Cancelar</button>
                        <button id="inventaryConfirmBt" class="confirmBt" type="button">
                            ${isEditing ? "Guardar cambios" : "Aceptar"}
                        </button>
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
                        <option value="${escapeHtml(sub.id)}" ${sub.id === selectedSubId ? "selected" : ""}>
                            ${escapeHtml(sub.name)}
                        </option>
                    `))
                    .join("");
            }

            fillSubcategories(presetSubcategory);
            categorySelect.addEventListener("change", () => fillSubcategories(null));

            // ------------------------------------------------------
            // ESCANDALLO: el producto puede armarse con insumos
            // ------------------------------------------------------
            const recetaToggle = document.getElementById("nisreceta");
            const recipeEditor = document.getElementById("recipeEditor");
            const recipeLines = document.getElementById("recipeLines");
            const recipeCostValue = document.getElementById("recipeCostValue");
            const stockField = document.getElementById("nstock");

            // Solo se pueden usar insumos que NO son recetas.
            const insumosPosibles = products.filter(p => !p.esReceta);

            let lineasReceta = isEditing && Array.isArray(editingProduct.ingredientes)
                ? editingProduct.ingredientes.map(ing => ({ ...ing }))
                : [];

            function recetaCosto() {
                return lineasReceta.reduce((suma, ing) => {
                    const insumo = products.find(p => p.id === ing.productId);
                    if (!insumo) return suma;
                    return suma + (Number(insumo.costoUnitario) || 0) * (Number(ing.cantidad) || 0);
                }, 0);
            }

            function renderRecipeLines() {
                if (lineasReceta.length === 0) {
                    recipeLines.innerHTML = `
                        <p class="dialogHint">Todavía no tiene ingredientes.</p>
                    `;
                    recipeCostValue.textContent = "$0";
                    return;
                }

                recipeLines.innerHTML = lineasReceta.map((ing, index) => {
                    const opciones = insumosPosibles.map(p => `
                        <option value="${escapeHtml(p.id)}" ${p.id === ing.productId ? "selected" : ""}>
                            ${escapeHtml(p.name)} (${escapeHtml(stockDeProducto(p))} ${escapeHtml(unitLabel(p))})
                        </option>
                    `).join("");

                    return `
                        <div class="recipeLine" data-index="${index}">
                            <select class="recipeProduct">${opciones}</select>
                            <input type="number" class="recipeQty" min="0" step="0.01"
                                   placeholder="Cantidad" value="${escapeHtml(ing.cantidad ?? "")}">
                            <button class="recipeRemove" type="button" aria-label="Quitar">&times;</button>
                        </div>
                    `;
                }).join("");

                recipeLines.querySelectorAll(".recipeLine").forEach(row => {
                    const index = Number(row.dataset.index);

                    row.querySelector(".recipeProduct").addEventListener("change", (event) => {
                        lineasReceta[index].productId = event.target.value;
                        renderRecipeLines();
                    });

                    row.querySelector(".recipeQty").addEventListener("input", (event) => {
                        lineasReceta[index].cantidad = Number(event.target.value) || 0;
                        recipeCostValue.textContent = `$${recetaCosto().toFixed(2)}`;
                    });

                    row.querySelector(".recipeRemove").addEventListener("click", () => {
                        lineasReceta.splice(index, 1);
                        renderRecipeLines();
                    });
                });

                recipeCostValue.textContent = `$${recetaCosto().toFixed(2)}`;
            }

            function toggleReceta() {
                const activo = recetaToggle.checked;
                recipeEditor.classList.toggle("hidden", !activo);

                // En una receta el stock sale de los insumos.
                stockField.disabled = activo;
                if (activo) {
                    stockField.value = "";
                    stockField.placeholder = "Lo calculan los insumos";
                } else {
                    stockField.placeholder = "Stock inicial";
                }
            }

            recetaToggle.addEventListener("change", () => {
                toggleReceta();
                renderRecipeLines();
            });

            document.getElementById("addRecipeLineBt").addEventListener("click", () => {
                if (insumosPosibles.length === 0) return;
                lineasReceta.push({ productId: insumosPosibles[0].id, cantidad: 1 });
                renderRecipeLines();
            });

            toggleReceta();
            renderRecipeLines();

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

                // Al editar se recuperan las variantes que ya tiene el
                // producto, para no tener que volver a escribirlas.
                const editingVariants = (isEditing && Array.isArray(editingProduct.variants))
                    ? editingProduct.variants
                    : null;

                let selectedVariantMode = isEditing
                    ? (editingProduct.variantMode || inferVariantMode(editingProduct))
                    : "unique";

                function sizeCheckboxesHtml(checkedSizes = []) {
                    const marcadas = new Set(checkedSizes);
                    return sizeList.map(size => `
                        <label class="sizeCheckboxOption">
                            <input type="checkbox" class="sizeCheck" value="${escapeHtml(size)}"
                                   ${marcadas.has(size) ? "checked" : ""}> ${escapeHtml(size)}
                        </label>
                    `).join("");
                }

                function qtyRowsHtml(sizes, cantidades = {}) {
                    return sizes.map(size => `
                        <div class="sizeQtyRow" data-size="${escapeHtml(size)}">
                            <span>${escapeHtml(size)}</span>
                            <input type="number" min="0" class="perSizeQty" placeholder="Cantidad"
                                   value="${escapeHtml(cantidades[size] ?? "")}">
                        </div>
                    `).join("");
                }

                function renderPerSizeRows(scopeEl, rowsContainer) {
                    const checked = [...scopeEl.querySelectorAll(".sizeCheck:checked")].map(c => c.value);

                    // Se conservan las cantidades ya escritas: antes de
                    // redibujar se leen los valores actuales.
                    const cantidades = {};
                    rowsContainer.querySelectorAll(".sizeQtyRow").forEach(row => {
                        const input = row.querySelector(".perSizeQty");
                        if (input && input.value !== "") cantidades[row.dataset.size] = input.value;
                    });

                    rowsContainer.innerHTML = qtyRowsHtml(checked, cantidades);
                }

                function addColorBlock(colorData = null) {
                    const container = document.getElementById("colorBlocks");
                    if (!container) return;

                    const colorName = colorData ? colorData.name : "";
                    const colorSizes = colorData ? colorData.sizes : [];
                    const colorCantidades = colorData ? colorData.cantidades : {};

                    const block = document.createElement("div");
                    block.className = "colorBlock";
                    block.innerHTML = `
                        <div class="productInputs">
                            <input type="text" class="colorNameInput" placeholder="Nombre del color (ej. Negro)"
                                   value="${escapeHtml(colorName)}">
                            <button class="cancelBt removeColorBt" type="button">Eliminar</button>
                        </div>
                        <div class="sizeCheckboxGrid">${sizeCheckboxesHtml(colorSizes)}</div>
                        <div class="sizeQtyRows colorQtyRows"></div>
                    `;
                    container.appendChild(block);

                    const rows = block.querySelector(".colorQtyRows");
                    rows.innerHTML = qtyRowsHtml(colorSizes, colorCantidades);

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

                    const tallas = editingVariants ? editingVariants.map(v => v.size) : [];

                    if (selectedVariantMode === "sameAll") {
                        const cantidad = (editingVariants && editingVariants.length > 0)
                            ? editingVariants[0].quantity
                            : "";

                        variantDetails.innerHTML = `
                            <div class="sizeCheckboxGrid">${sizeCheckboxesHtml(tallas)}</div>
                            <input id="sameAllQty" type="number" min="0" class="sizeQtyInput"
                                   placeholder="Cantidad por talla seleccionada"
                                   value="${escapeHtml(cantidad)}">
                        `;
                    } else if (selectedVariantMode === "perSize") {
                        const cantidades = {};
                        if (editingVariants) {
                            editingVariants.forEach(v => { cantidades[v.size] = v.quantity; });
                        }

                        variantDetails.innerHTML = `
                            <div class="sizeCheckboxGrid">${sizeCheckboxesHtml(tallas)}</div>
                            <div id="perSizeQtyRows" class="sizeQtyRows"></div>
                        `;
                        const rows = document.getElementById("perSizeQtyRows");
                        rows.innerHTML = qtyRowsHtml(tallas, cantidades);

                        variantDetails.querySelectorAll(".sizeCheck").forEach(chk => {
                            chk.addEventListener("change", () => renderPerSizeRows(variantDetails, rows));
                        });
                    } else if (selectedVariantMode === "colorSize") {
                        variantDetails.innerHTML = `
                            <div id="colorBlocks" class="colorBlocks"></div>
                            <button id="addColorBt" class="cancelBt" type="button">+ Agregar color</button>
                        `;
                        document.getElementById("addColorBt").addEventListener("click", () => addColorBlock());

                        if (editingVariants && editingVariants.length > 0) {
                            // Se reconstruye un bloque por cada color.
                            const porColor = new Map();
                            for (const v of editingVariants) {
                                const key = v.color || "";
                                if (!porColor.has(key)) {
                                    porColor.set(key, { name: key, sizes: [], cantidades: {} });
                                }
                                const entry = porColor.get(key);
                                entry.sizes.push(v.size);
                                entry.cantidades[v.size] = v.quantity;
                            }
                            porColor.forEach(entry => addColorBlock(entry));
                        } else {
                            addColorBlock();
                        }
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
                <div class="restockItem" data-id="${escapeHtml(prod.id)}">
                    <div class="restockInfo">
                        <strong>${escapeHtml(prod.name)}</strong>
                        <span>Stock actual: ${escapeHtml(prod.quantity)}</span>
                    </div>
                    <div class="restockInputs">
                        <select id="pack-${escapeHtml(prod.id)}">
                            ${packSelectOptions}
                        </select>
                        <input id="inputRestock-${escapeHtml(prod.id)}" class="restockQty" type="text"
                               inputmode="text" placeholder="ej: 2 + 16" value="">
                        <span class="restockPreview" id="preview-${escapeHtml(prod.id)}">= 0 u.</span>
                    </div>
                </div>
                `;
            }).join('');

            modalcont.innerHTML = `
                <div class="restockModalContainer show">
                    <h3>Reponer inventario</h3>
                    <p class="restockHint">
                        Puedes escribir sumas y restas. El primer número usa el empaque elegido
                        y los siguientes son unidades sueltas:
                        <code>Paquete de 6 · 2 + 16</code> = 28 unidades.
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

            // Filtrado rápido y dinámico
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
        // NUEVA COMPRA A PROVEEDOR
        // Usa el mismo contenedor centrado del Restock (#modali)
        // =========================
        case 'newPurchase': {
            const knownSuppliers = [...new Set(purchases.map(p => p.proveedor))];
            const supplierOptions = knownSuppliers
                .map(name => `<option value="${escapeHtml(name)}"></option>`)
                .join("");

            modalcont.innerHTML = `
                <div class="restockModalContainer show purchaseForm">
                    <h3>Registrar compra a proveedor</h3>
                    <p class="restockHint">
                        Los productos que agregues entran como stock nuevo. La compra
                        queda registrada en la lista de Compras y en el historial de
                        movimientos del inventario.
                    </p>

                    <div class="purchaseFormSection">
                        <span class="purchaseFormTitle">Proveedor</span>
                        <input id="purchaseSupplier" type="text" class="purchaseSupplierInput"
                               list="supplierList" placeholder="Nombre del proveedor" autocomplete="off">
                        <datalist id="supplierList">${supplierOptions}</datalist>
                    </div>

                    <div class="purchaseFormSection">
                        <span class="purchaseFormTitle">Productos</span>

                        <div class="purchaseLine purchaseLineHead">
                            <span class="hProduct">Producto</span>
                            <span class="hNum">Cantidad</span>
                            <span class="hNum">Precio</span>
                            <span class="hTotal">Total</span>
                            <span class="hRemove"></span>
                        </div>

                        <div id="purchaseLines"></div>

                        <button id="addPurchaseLineBt" class="addLineBt" type="button">+ Agregar producto</button>
                    </div>

                    <div class="purchaseSummary">
                        <span>Total de la compra</span>
                        <strong id="purchaseTotal">$0</strong>
                    </div>

                    <div class="buttons">
                        <button id="inventaryCancelBt" class="cancelBt" type="button">Cancelar</button>
                        <button id="inventaryConfirmBt" class="confirmBt" type="button">Registrar compra</button>
                    </div>
                </div>
            `;

            const linesContainer = document.getElementById("purchaseLines");
            const totalElement = document.getElementById("purchaseTotal");
            const lines = [];

            function productOptionsHtml(selectedId) {
                return products.map(product => `
                    <option value="${escapeHtml(product.id)}" ${product.id === selectedId ? "selected" : ""}>
                        ${escapeHtml(product.name)}
                    </option>
                `).join("");
            }

            function updateTotal() {
                const total = lines.reduce((sum, line) => sum + (line.cantidad || 0) * (line.precio || 0), 0);
                totalElement.textContent = `$${total}`;
            }

            function renderLines() {
                linesContainer.innerHTML = lines.map((line, index) => `
                    <div class="purchaseLine" data-index="${index}">
                        <select class="purchaseProduct">${productOptionsHtml(line.productId)}</select>
                        <input type="number" class="purchaseQty" min="1" step="1" value="${line.cantidad}">
                        <input type="number" class="purchasePrice" min="0" step="1" value="${line.precio}">
                        <span class="purchaseLineTotal">$${(line.cantidad || 0) * (line.precio || 0)}</span>
                        <button class="purchaseLineRemove" type="button" aria-label="Quitar producto">&times;</button>
                    </div>
                `).join("");

                linesContainer.querySelectorAll(".purchaseLine[data-index]").forEach(row => {
                    const index = Number(row.dataset.index);

                    row.querySelector(".purchaseProduct").addEventListener("change", (event) => {
                        lines[index].productId = event.target.value;
                    });

                    // El total de la línea y el total general se actualizan en
                    // el sitio: redibujar toda la lista perdería el foco
                    // mientras se escribe.
                    row.querySelector(".purchaseQty").addEventListener("input", (event) => {
                        lines[index].cantidad = Math.max(0, Number(event.target.value) || 0);
                        row.querySelector(".purchaseLineTotal").textContent =
                            `$${lines[index].cantidad * (lines[index].precio || 0)}`;
                        updateTotal();
                    });

                    row.querySelector(".purchasePrice").addEventListener("input", (event) => {
                        lines[index].precio = Math.max(0, Number(event.target.value) || 0);
                        row.querySelector(".purchaseLineTotal").textContent =
                            `$${(lines[index].cantidad || 0) * lines[index].precio}`;
                        updateTotal();
                    });

                    row.querySelector(".purchaseLineRemove").addEventListener("click", () => {
                        lines.splice(index, 1);
                        renderLines();
                    });
                });

                updateTotal();
            }

            // Si vienen productos precargados (lista de reorden), se
            // ponen con la cantidad sugerida para dejar el stock arriba
            // del mínimo.
            if (productosPrecargados && productosPrecargados.length > 0) {
                for (const producto of productosPrecargados) {
                    lines.push({
                        productId: producto.id,
                        cantidad: suggestedOrderQuantity(producto),
                        precio: 0
                    });
                }
            } else {
                // La primera línea ya viene con un producto y cantidad 1.
                lines.push({ productId: products[0].id, cantidad: 1, precio: 0 });
            }
            renderLines();

            document.getElementById("addPurchaseLineBt").addEventListener("click", () => {
                lines.push({ productId: products[0].id, cantidad: 1, precio: 0 });
                renderLines();
            });

            document.getElementById("inventaryCancelBt").addEventListener("click", cancelCurrentAction);
            document.getElementById("inventaryConfirmBt").addEventListener("click", confirmButton);
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
                            <strong>${escapeHtml(entry.productName)}</strong>
                            <span>
                                ${escapeHtml(formatHistoryDate(entry.date))} ·
                                ${escapeHtml(ACTION_LABELS[entry.action] || entry.action)}${entry.unit ? " · " + escapeHtml(entry.unit) : ""}
                            </span>
                        </div>
                        <div class="historyDelta">
                            <strong class="${entry.change < 0 ? "down" : "up"}">
                                ${entry.change > 0 ? "+" : ""}${escapeHtml(entry.change)}
                            </strong>
                            <span>Stock: ${escapeHtml(entry.resultingStock)}</span>
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
        console.error("billListObj no existe");
        return;
    }

    billListObj.innerHTML = "";

    for (let consumedProduct of myList) {
            billListObj.innerHTML += `
            <div class="billItem" data-id="${escapeHtml(consumedProduct.id)}">
                <strong>${escapeHtml(consumedProduct.orderid)}</strong>
                <span>${escapeHtml(consumedProduct.name)}</span>
                <strong>$${escapeHtml(consumedProduct.price)}</strong>
                <button class="minusButton" type="button">−</button>
                <p>${escapeHtml(consumedProduct.quantity)}</p>
                <button class="deleteItem" type="button" data-id="${escapeHtml(consumedProduct.id)}">x</button>
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
   13. ACCUMULATE ACTIONS (la cuenta)
   ============================================================ */

async function accumulateActions(action, event) {
    const card = event.target.closest(".productCard");
    if (!card) return;

    const product = products.find(prod => String(prod.id) === String(card.dataset.id));

    if (!product) {
        console.error("Producto no encontrado. ID de tarjeta:", card.dataset.id);
        return;
    }

    // En modo editar no se abre el panel de la cuenta: se abre el
    // formulario del producto con todos sus datos.
    if (action === "editProduct") {
        openProductEditor(product);
        return;
    }

    accumulatePanel.classList.remove("closing");
    accumulatePanel.classList.add("show");

    syncActionsBar();

    let obj = myList.find(value => String(value.id) === String(product.id));

    switch (action) {
        case 'bill': {
            // Agregar el producto a la cuenta
            if (obj === undefined) {
                myList.push({
                    id: product.id,
                    orderid: ++billOrderCounter,
                    name: product.name,
                    price: Number(product.price),
                    quantity: 1
                });
            } else {
                obj.quantity += 1;
            }

            // Sumar el precio al total
            bill += Number(product.price);

            // Crear el panel de la cuenta
            accModalContent.innerHTML = `
                    <div class="billHeader">
                        <h2>Cuenta</h2>
                        <strong id="billTotal">$${bill}</strong>
                    </div>

                    <div id="billList" class="billList"></div>
                `;

            // Obtener la lista recién creada
            const billListObj = document.getElementById("billList");

            // Renderizar los productos
            displayBill(billListObj);

            // Manejar los botones de menos y eliminar
            billListObj.addEventListener("click", (event) => {
                const billItem = event.target.closest(".billItem");
                if (!billItem) return;

                const productId = billItem.dataset.id;
                const billProduct = myList.find(item => String(item.id) === String(productId));
                if (!billProduct) return;

                // MENOS
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
                // ELIMINAR
                else if (event.target.classList.contains("deleteItem")) {
                    deleteItem(billProduct, billListObj);
                    if (myList.length === 0) {
                        updateBill();
                    }
                }
            });
            break;
        }
    }

    // El panel ya tiene su contenido: se mide para empujar el contenido
    // y que la barra de acciones no quede tapada.
    syncActionsBar();
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

createProfileBt.addEventListener("click", openProfileCreation);

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

renameProfileBt.addEventListener("click", async () => {
    if (!currentUser) return;

    const newName = await showPrompt({
        title: "Cambiar nombre",
        label: "Nuevo nombre del perfil",
        value: currentUser.profile.name,
        validate: (value) => {
            if (value.length === 0) return "El nombre no puede quedar vacío.";
            const users = getUsers();
            const exists = users.some(
                user =>
                    user.id !== currentUser.id &&
                    user.profile.name.toLowerCase() === value.toLowerCase()
            );
            return exists ? "Ya existe un perfil con ese nombre." : null;
        }
    });

    if (newName === null) return;

    currentUser.profile.name = newName.trim();

    saveCurrentUser();
    updateProfileUI();
    displayProfiles();
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

// --- Clics en la lista de productos ---
allProducts.addEventListener("click", (event) => {
    // 1) Botón ⋮: abre el menú de la tarjeta (sin sumar a la cuenta)
    const menuBtn = event.target.closest(".cardMenuBtn");
    if (menuBtn) {
        event.stopPropagation();
        toggleCardMenu(menuBtn);
        return;
    }

    // 2) Opción del menú
    const menuItem = event.target.closest("[data-card-action]");
    if (menuItem) {
        event.stopPropagation();
        closeCardMenus();
        handleCardAction(menuItem.dataset.cardAction, menuItem.closest(".productCard"));
        return;
    }

    // 3) Casilla de selección: no cuenta como clic en el producto
    if (event.target.classList.contains("cardSelect")) {
        event.stopPropagation();
        return;
    }

    // 4) Clic en la tarjeta: se suma a la cuenta
    accumulateActions(act, event);
});

// La casilla actualiza la selección y la barra flotante
allProducts.addEventListener("change", (event) => {
    if (event.target.classList.contains("cardSelect")) {
        updateSelection();
    }
});

// Clic fuera de la tarjeta cierra el menú ⋮
document.addEventListener("click", (event) => {
    if (!event.target.closest(".cardMenu") && !event.target.closest(".cardMenuBtn")) {
        closeCardMenus();
    }
});

// --- Teclado: las tarjetas de producto y las acciones de la barra
//     son elementos con rol de botón, así que Enter o Espacio
//     deben activarlos igual que un clic. ---
allProducts.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;

    const card = event.target.closest(".productCard");
    if (!card) return;

    event.preventDefault();
    card.click();
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

// --- Compras a proveedores ---
purchasesBt.addEventListener("click", showPurchasesView);

newPurchaseBt.addEventListener("click", async () => {
    if (products.length === 0) {
        await showAlert({
            title: "Sin productos",
            message: "Primero agrega productos al inventario: una compra suma stock a productos que ya existen."
        });
        return;
    }

    act = "newPurchase";
    myInventaryActions('newPurchase');
});

purchasesList.addEventListener("click", (event) => {
    const button = event.target.closest("button");
    if (!button) return;

    if (button.dataset.viewPurchase) {
        const purchase = purchases.find(p => p.id === button.dataset.viewPurchase);
        if (purchase) showPurchaseDetail(purchase);
        return;
    }

    if (button.dataset.voidPurchase) {
        voidPurchase(button.dataset.voidPurchase);
    }
});

// --- Exportar / importar datos ---
exportDataBt.addEventListener("click", () => {
    profileMenu.classList.add("hidden");
    exportProfileData();
});

importDataBt.addEventListener("click", () => {
    profileMenu.classList.add("hidden");
    importFileInput.click();
});

importFileInput.addEventListener("change", async () => {
    const file = importFileInput.files && importFileInput.files[0];
    importFileInput.value = "";   // permite reimportar el mismo archivo
    if (file) await importProfileData(file);
});

// --- Proveedores y pedido de reposición ---
suppliersBt.addEventListener("click", showSuppliersPanel);
orderReorderBt.addEventListener("click", showPedidoReorden);

// --- Barra flotante de selección ---
selEditBt.addEventListener("click", async () => {
    const lista = getSelectedProducts();

    if (lista.length !== 1) {
        await showAlert({
            title: "Editar producto",
            message: "Para editar un producto, marca solo uno."
        });
        return;
    }

    openProductEditor(lista[0]);
});

selPriceBt.addEventListener("click", () => changeProductPrice(getSelectedProducts()));
selDeleteBt.addEventListener("click", () => deleteProducts(getSelectedProducts()));

selCancelBt.addEventListener("click", () => {
    clearSelection();
});

// --- Acumulate panel buttons ---
accCancelBt.addEventListener("click", cancelCurrentAction);
accConfirmBt.addEventListener("click", confirmButton);

// --- Inventory action buttons (restock / add product / history) ---
restock.addEventListener("click", async () => {
    // Si estamos dentro de una categoría, el Reponer trabaja sobre esos productos
    if (getVisibleProducts().length === 0) {
        await showAlert({ title: "No hay productos", message: "No hay productos para reabastecer aquí." });
        return;
    }

    act = "restock";
    myInventaryActions('restock');
});

addProduct.addEventListener("click", () => {
    editingProduct = null;
    act = "addProduct";
    myInventaryActions('addProduct');
});

historyBt.addEventListener("click", () => {
    act = "history";
    myInventaryActions('history');
});

// Desplaza la página hasta una sección de la landing.
// Se usa window.scrollTo con la posición calculada a mano en vez de
// scrollIntoView: así el scroll va al documento y no a un contenedor
// interno que pueda interceptarlo.
function scrollToLandingSection(section) {
    if (!section) return;

    const inicio = section.getBoundingClientRect().top + window.scrollY;

    window.scrollTo({
        top: inicio,
        behavior: "smooth"
    });
}

// --- Bienvenida / landing (MenúStock) ---
welcomeGetStartedBt.addEventListener("click", enterApp);
welcomeMakeItYoursBt.addEventListener("click", enterApp);
welcomeFinalCtaBt.addEventListener("click", enterApp);

welcomeLearnBt.addEventListener("click", () => {
    scrollToLandingSection(aboutSection);
});

welcomeOriginBt.addEventListener("click", () => {
    scrollToLandingSection(originSection);
});

// Volver a la Welcome page desde dentro de la app, sin cerrar
// sesión ni tocar el flag de "ya vista": al presionar de nuevo
// "Empezar" / "Crea tu perfil", enterApp() te regresa
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

if (wasWelcomeSeen()) {
    enterApp();
} else {
    showWelcomeOnly();
}
