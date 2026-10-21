# CONTEXTO PARA ASISTENTES DE IA — MenúStock

> Documento de traspaso. Describe el estado real del código para que otra persona (o otro modelo) pueda trabajar sobre él sin romper nada.
> Última actualización: 21 de octubre de 2026 · commit `302699c` · **129/129 pruebas E2E en verde**.

---

## 1. Qué es MenúStock

Aplicación web de **gestión de inventario** para pequeños comercios (tiendas, restaurantes, cafeterías). Un dueño lleva con ella: qué productos tiene, cuánto entró, cuánto salió, qué se está agotando y a qué proveedor hay que comprarle.

- **URL en producción:** https://andrescorena96-ux.github.io/MenuStock/
- **Repositorio:** `https://github.com/andrescorena96-ux/MenuStock` (público)
- **Alcance actual:** la app cubre el ciclo del **negocio** (inventario, reposición, compras a proveedores, venta). **No** incluye un catálogo público para el cliente final ni backend.

### Decisiones de producto que NO deben revertirse sin preguntar

| Decisión | Por qué |
|---|---|
| **Local-first, sin backend** | La app funciona sin internet, sin cuentas y sin que nadie vea los datos del negocio. El respaldo es *Exportar/Importar*. Migrar a Supabase/Firebase es un cambio de arquitectura, no un refactor: hay que decidir login, allotamiento de claves y manejo de errores de red. |
| **Un solo `localStorage` con un array de perfiles** | Todo el estado vive en `menuStockUsers`. Los perfiles son negocios independientes dentro del mismo dispositivo. |
| **Contraseñas en texto plano** | Aceptable en local; se anota como límite conocido. Al añadir backend hay que hashear. |
| **Sin framework, sin build** | HTML + CSS + JS vanilla. Se clone y funciona. Añadir un bundler es una decisión grande. |
| **Traducción de UI al español** | Toda la interfaz, mensajes y comentarios del código están en español. El nombre de la marca es `MenúStock` (con tilde). |

---

## 2. Cómo se ejecuta

```bash
npm start                 # servidor estático en http://localhost:8080
npm test                  # suite E2E en navegador headless (129 casos)

node tests/run.js --url=https://andrescorena96-ux.github.io/MenuStock
                           # corre la suite contra el sitio YA DESPLEGADO
```

**Requisito:** los módulos ES no funcionan con `file://`. Hay que servir por HTTP siempre.

**Despliegue:** GitHub Pages publica la rama `main` desde la raíz. Cada `git push` a `main` dispara el redespliegue (tarda ~1 min). El `.nojekyll` está en la raíz para que GitHub no procese los archivos.

**Flujo de trabajo:**

```bash
git checkout -b feature/x
# ... editar ...
npm test                                   # 129/129 antes de commitear
git commit -m "feat: ..."
git push origin feature/x                   # abrir PR
# al fusionar a main -> Pages se redespliega solo
```

---

## 3. Arquitectura

```
MenuStock/
├── index.html          477 líneas   Estructura del DOM
├── home.css          3.411 líneas   Sistema visual completo
├── home.js           4.272 líneas   Toda la lógica (110 funciones)
├── dev-server.js        52 líneas   Servidor estático de desarrollo
├── package.json         17 líneas   npm start / npm test
├── README.md           203 líneas   Guía rápida
├── DOCUMENTACION.md    419 líneas   Documentación funcional (para humanos)
├── CONTEXTO.md                     Este documento
├── assets/
│   ├── logo.png               Logo horizontal, cabecera (1000×260, alfa)
│   ├── logo.svg               Su fuente vectorial
│   ├── logo-menustock.png     Logo cuadrado, portada (800×800)
│   └── logo-menustock.svg     Su fuente vectorial
└── tests/
    ├── e2e.html          1.088 líneas   Prueba end-to-end
    └── run.js              125 líneas   Runner (Edge/Chrome headless)
```

**Todo el código de la aplicación vive en `home.js`.** No hay módulos separados ni imports: es un único módulo ES con 28 secciones numeradas. Esto es deliberado (la app se despliega como un sitio estático de un solo archivo) pero significa que **el archivo es grande** y hay que buscar por sección.

### Secciones de `home.js`

| # | Sección | Qué hace |
|---|---|---|
| 1 | DOM REFERENCES | Todas las referencias al DOM, arriba del todo |
| 1b | UTILIDADES DE TEXTO Y URL | `escapeHtml()`, `safeImageUrl()`, tabla de unidades y conversiones |
| 1c | SISTEMA DE DIÁLOGOS | `showAlert` / `showConfirm` / `showPrompt` / `showInfo` (promesas) |
| 2 | STATE VARIABLES | `products`, `categories`, `purchases`, `proveedores`, `stockHistory`, `historial`, `act`, `editingProduct`, `selectedProductIds`… |
| 3 | LOCALSTORAGE / USER PERSISTENCE | `getUsers`, `saveUsers`, `saveCurrentUser` |
| 3b | HISTORIAL DE STOCK | `recordStockChange()`, `formatHistoryDate()` |
| 3c | EXPRESIONES DE RESTOCK | `parseRestockExpression()`, conversión de unidades |
| 3d | AYUDANTES DEL PANEL DE RESTOCK | Vista previa en vivo, navegación por teclado |
| 3e | BIENVENIDA / LANDING | Mostrar/ocultar la portada |
| 4 | PROFILE SELECTION SCREEN | Lista de perfiles |
| 4b | PASSWORD GATE | Puerta de contraseña |
| 4c | FORMULARIO DE NUEVO PERFIL | Diálogo con nombre, negocio, color, contraseña |
| 4d | FLUJO DE CREACIÓN DE PERFIL | `openProfileCreation()` / `cerrarTodosLosModales()` |
| 4e | CREAR PERFIL | `finishProfileCreation()` |
| 5 | PROFILE MENU (topbar) | `updateProfileUI()` |
| 5b | CATEGORÍAS Y SUBCATEGORÍAS | Árbol de dos niveles |
| 5c | COMPRAS A PROVEEDORES | Lista y alta de compras |
| 5d | EXPORTAR / IMPORTAR DATOS | Respaldo en JSON |
| 5e | MENÚ POR TARJETA Y SELECCIÓN MÚLTIPLE | Menú ⋮, casillas, barra flotante |
| 5f | RECETAS (ESCANDALLO) Y COSTOS | `costoDeProducto`, `margenDeProducto`, `stockDeProducto`, `descontarPorVenta` |
| 5g | PROVEEDORES | Directorio y generador de pedido |
| 6 | PRODUCT DISPLAY | `display()` — pinta las tarjetas |
| 7 | SEARCH / FILTER | `filterAn()` — texto + estado |
| 8 | BILL / HISTORIAL HELPERS | `updateBill()`, `addToHistorial()` |
| 9 | MODAL HELPERS | `closeModal()` |
| 9b | LEER EL FORMULARIO DE PRODUCTO | `readProductForm()` |
| 10 | CONFIRM / CANCEL ACTIONS | `confirmButton()` — el `switch (act)` central |
| 11 | INVENTORY ACTION MODALS | `myInventaryActions()` — producto, reposición, compra, historial |
| 12 | BILL DISPLAY | `displayBill()` |
| 13 | ACCUMULATE ACTIONS | `accumulateActions()` — clic en tarjeta |
| 14 | EVENT LISTENERS | Todos al final |
| 15 | APP INITIALIZATION | `initializeProfiles()` y arranque |

---

## 4. Modelo de datos

Un único `localStorage`:

| Clave | Contenido |
|---|---|
| `menuStockUsers` | Array de perfiles (todo el estado) |
| `menuStockCurrentUser` | Id del último perfil usado |
| `menuStockWelcomeSeen` | `"true"` si ya se vio la landing |

Claves antiguas que se migran automáticamente una vez y se borran: `inventoryUsers`, `currentInventoryUser`, `creatussinessWelcomeSeen`.

### Perfil

```js
{
  id: "uuid",
  profile: { name: "Mi Tienda", business: "Bodega Don Pepe", color: "rust" },
  password: "1234" | null,          // null = se abre sin preguntar
  storeType: "general" | "clothing" | "other",
  clothingConfig: { sizeSystem: "letter", sizeList: ["XS","S","M","L","XL"] } | null,
  products: [...],
  restockPreferences: { productId: "12" },   // empaque preferido (string)
  historial: [...],                // ventas
  stockHistory: [...],             // movimientos de stock (máx. 1.000)
  categories: [...],
  purchases: [...],
  proveedores: [...]
}
```

### Producto

```js
{
  id: "p-1723456789-a1b2c3d4",     // SIEMPRE único (ver "bugs corregidos")
  name: "Gaseosa 1.5L",
  price: 2800,                      // precio de venta
  quantity: 48,                     // stock en la unidad del producto
  image: "https://…",               // URL validada
  category: "uuid" | null,
  subcategory: "uuid" | null,
  minStock: 12,                     // 0 = sin alerta de reorden
  unit: "und" | "kg" | "g" | "L" | "ml" | "caja" | "paq",
  costoUnitario: 2100,              // costo de compra (por unidad del producto)
  proveedorId: "uuid" | null,
  esReceta: false,                  // true = preparado con insumos
  ingredientes: [{ productId, cantidad }],   // solo si esReceta
  variants: [{ size, color, quantity }] | null,  // solo tienda de ropa
  season, collection, series, supplier,        // solo tienda de ropa
  createdIn: "2026-10-21T…"
}
```

### Movimiento de stock (`stockHistory`)

```js
{ id, productId, productName, date: ISO, action, change, resultingStock, unit }
```

`action` ∈ `created` | `restock` | `adjustment` | `sale` | `deleted` | `purchase` | `purchaseVoid` | `merma`

**Regla:** todo cambio de stock pasa por `recordStockChange()`. Ningún cambio queda sin rastro.

### Compra a proveedor (`purchases`)

```js
{ id, fecha: ISO, proveedor: "Distribuidora Don Pepe",
  items: [{ productId, nombre, cantidad, precioUnitario }],
  total, anulada: false }
```

### Proveedor

```js
{ id, name, phone, note }
```

---

## 5. Reglas del código

### Reglas obligatorias (romperlas mete bugs)

1. **Escapar todo texto del usuario antes de meterlo en `innerHTML`.** Usar `escapeHtml(valor)`. Si el valor va en un atributo, `escapeHtml` también (escapa comillas).
2. **Validar URLs de imagen** con `safeImageUrl(url)`; si no es válida, usar `PLACEHOLDER_IMAGE`.
3. **Nunca `eval` ni `new Function`.** La entrada de reposición se valida con regex y se suma a mano.
4. **Toda mutación de stock se registra** con `recordStockChange()`.
5. **Toda mutación llama a `saveCurrentUser()`** si cambia algo persistido. forgetting esto ya causó un bug real (merma, precio y borrado no se guardaban).
6. **Los diálogos propios no usan `prompt`/`alert`/`confirm` nativos.** Usar `showAlert`, `showConfirm`, `showPrompt`, `showInfo`.
7. **Los `id` del HTML son contrato.** `home.js` los busca por id; `home.css` por clase. Renombrarlos rompe la app.
8. **No tocar `header h1` ni `header` global**: están acotados a `#appRoot > header` porque un `<header>` dentro de un formulario heredaba el estilo de la cabecera.

### Convenciones

- **Idioma:** interfaz, mensajes, comentarios y nombres de variables de negocio en **español**. Los identificadores técnicos (`products`, `stockHistory`, `escapeHtml`) van en inglés/español mixto según lo heredado.
- **CSS:** todo el color, radio, sombra y tipografía sale de tokens en `:root`. No escribir colores hex sueltos (salvo dentro de un bloque de tema específico, con comentario).
- **Movimientos de stock:** valores en la **unidad del producto**. Si el empaque viene en otra unidad (kg) y el producto se mide en otra (g), se convierte con `convertirUnidad()`.
- **Vistas:** `showProductsView()`, `showCategoriesView()`, `showPurchasesView()` controlan qué se ve. Cada una llama a `syncActionsBar()`.
- **Modales de inventario:** todos pasan por `myInventaryActions(action)`, que reutiliza el mismo contenedor `#actionPan` / `#modali-content`.
- **Capas (z-index):** `#appRoot > header` 500 · `.overlay` (`#actionPan`) **10000** · `.profileMenu` 9000 · `.profileSection` 9999 · `.dialogRoot` **12000**. Antes de abrir una ventana nueva, cerrar la anterior (`cerrarTodosLosModales()`).

---

## 6. Flujos principales

### Crear un perfil

`createProfileBt` → `openProfileCreation()` (oculta la pantalla de perfiles) → modal de **tipo de negocio** → si es ropa, modal de **sistema de tallas** → `finishProfileCreation()` → diálogo con **nombre, negocio, color y contraseña** → se guarda → `selectProfile()`.

Al cancelar cualquier paso se vuelve a la lista de perfiles (`showProfiles()`).

### Alta y edición de un producto

`myInventaryActions("addProduct")` monta el formulario. Sirve para alta y para edición (el mismo form; si `editingProduct` está cargado, se prellena). `readProductForm()` devuelve los datos o un error de validación. `confirmButton()` con `act === "addProduct"` crea; con `act === "editProduct"` actualiza.

Campos: nombre, precio, imagen, stock, categoría, subcategoría, **stock mínimo**, **unidad**, **costo de compra**, **proveedor**, y (opcional) **receta con ingredientes**.

### Menú ⋮ por tarjeta

Cada tarjeta tiene un botón de tres puntos (aparece al pasar el mouse; en táctil siempre visible) con: **Editar producto**, **Cambiar precio**, **Registrar merma**, **Eliminar producto**. Un clic fuera lo cierra.

### Selección múltiple

Casilla en cada tarjeta. Al marcar una o más aparece una **barra flotante** con Editar / Cambiar precio / Eliminar / Cancelar.

### Reposición

`restock` → hoja oscura con una fila por producto: empaque, cantidad y **vista previa en vivo** del resultado (ya convertido a la unidad del producto). Expresiones: `2 + 16`, `-3`, `10 - 2`. El primer número usa el empaque; el resto son unidades sueltas.

### Compra a proveedor

Vista **Compras** → arriba la **lista de reorden** (lo que está por debajo del mínimo, agrupado por proveedor) con botón *Generar compra con estos* (prellena el formulario con la cantidad sugerida) → *+ Nueva compra* → líneas de producto → al guardar, el stock sube y queda movimiento `purchase`.

### Venta

Clic en las tarjetas → se arma la **cuenta** (panel inferior). Botón *Aceptar* → se descuenta el stock (en una receta, se descuentan los insumos), se registra la venta y los movimientos `sale`.

---

## 7. Lo que ya está hecho

- [x] Landing de 8 secciones con entrada a la app
- [x] Multiperfil con contraseña opcional, color y nombre de negocio
- [x] Gate de contraseña
- [x] Inventario: alta, edición, borrado, búsqueda, filtro por precio/stock y **por estado**
- [x] Categorías y subcategorías con migas de pan
- [x] Reposición con empaques, expresiones y **conversión de unidades**
- [x] **Mermas** con motivo
- [x] **Stock mínimo** con estados 🟢🟡🔴 y lista de reorden
- [x] **Costos y margen** por producto
- [x] **Escandallo**: recetas con descuento automático de insumos
- [x] Compras a proveedores + directorio de proveedores + **pedido para WhatsApp**
- [x] Cuenta / venta con validación de stock
- [x] Historial de movimientos (1.000 máx.) y de ventas
- [x] Exportar / importar datos (JSON)
- [x] Menú ⋮ por tarjeta + barra flotante multi-selección
- [x] Tienda de ropa: tallas, colores, cantidades por variante
- [x] Logo oficial (cuadrado para la portada, horizontal para la cabecera)
- [x] Suite E2E de 129 casos

---

## 8. Límites conocidos

| Límite | Detalle |
|---|---|
| **Contraseñas sin cifrar** | `localStorage` no cifra. Aceptable en local; crítico con backend. |
| **Un solo dispositivo** | Sin sincronización. El respaldo es exportar/importar. |
| **Historial de ventas sin pantalla** | Los datos se guardan (`historial`) pero no se muestran en ninguna vista. |
| **Recetas no anidadas** | Una receta usa insumos simples, no otras recetas. Anidar requiere resolver ciclos. |
| **Sin virtualización** | `display()` re-renderiza la lista completa. Instantáneo para inventarios de tienda; con miles de productos hay que virtualizar. |
| **CSS con `!important`** | Sobre todo en `#modali` y `#modali-content`. Funciona, pero afinar estilos ahí es frágil. |
| **Nombres heredados** | `#modali`, `#modali-content`, `.closing` (convive con `.show`). |
| **Compras sin proveedor vinculado** | El proveedor se guarda como texto libre en la compra; el directorio de proveedores es aparte. |
| **Los tests dependen del DOM real** | El E2E monta la app en un navegador; no hay unit tests sueltos. |

---

## 9. Bugs reales ya corregidos (no reintroducirlos)

1. **Ids de producto duplicados.** Eran `inicial + Date.now()`: dos productos con la misma inicial creados en el mismo milisegundo compartían id y toda búsqueda por id devolvía el equivocado. Ahora: `p-<timestamp>-<uuid8>`.
2. **El filtro de búsqueda se perdía al guardar.** `refreshProducts()` llamaba a `display()` directo; ahora pasa por `filterAn()`.
3. **Dos modales superpuestos al crear un perfil.** `.overlay` tenía `z-index: 1000` y `.profileSection` 9999: el modal de tipo de negocio abría *detrás*. Ahora el overlay es 10000 y la pantalla de perfiles se oculta durante el flujo.
4. **Merma, cambio de precio y borrado no se guardaban.** Faltaba `saveCurrentUser()` en las tres acciones del menú ⋮.
5. **La vista de categoría se perdía al confirmar** una acción. `display(products)` pintaba todo; ahora `refreshProducts()`.
6. **El filtro por precio ordenaba como texto.** `.sort()` sin comparador: 100 antes que 20.
7. **El historial de ventas guardaba `[object Object]`.**
8. **Se podía vender más stock del disponible** y quedaba negativo.
9. **Un `<header>` dentro de un formulario heredaba la cabecera oxblood** de la app.
10. **Los botones ⋮ de las tarjetas se colgaban** al cambiar de vista.
11. **Las tarjetas se recortaban en viewports bajos.** La app es una caja de altura fija (`#appRoot { height: 100dvh }`) con scroll interno; si el header + buscador + título se comían la pantalla, `.productList` colapsaba (medido: 11 px en un viewport de 360×640) y las tarjetas quedaban cortadas: solo se veían la imagen y la casilla. Solución: `min-height` en la lista y, con `@media (max-height: 720px)`, la app deja de ser de altura fija y hace scroll la página.
12. **El botón ⋮ y la casilla eran invisibles sin hover.** Con `opacity: 0` nunca se descubrían en táctil. Ahora van en `opacity: 0.55` en reposo.

---

## 10. Convenciones para quien reciba este contexto

- **Antes de tocar código, lee la sección correspondiente de `home.js`.** Está numerada a propósito.
- **Escribe primero la prueba.** La suite es un `tests/e2e.html` que se lee casi como una historia de usuario; añadir un caso es añadir un bloque con `ok("nombre", condición)`.
- **Si añades un campo al producto**, actualiza: el modelo (§4), el formulario (`readProductForm` + `myInventaryActions`), los guards de compatibilidad de `selectProfile()` y la prueba.
- **Si añades un movimiento de stock**, añádelo a `ACTION_LABELS` y a la lista de `action` del §4.
- **Si añades un modal**, usa `openDialog()`: asigna `dialogResolve = resolve` y devuelve el valor desde el `onClick`. No reuses `#actionPan` para cosas que no sean modales de inventario.
- **No renombres `id` ni clases** sin actualizar CSS y JS a la vez.
- **No introduzcas `prompt`/`alert`/`confirm` nativos.** Rompen el diseño y bloquean la pantalla.
- **Verifica siempre con `npm test`**, y contra el sitio desplegado con `node tests/run.js --url=…` antes de dar algo por terminado.
- **Los commits van en español**, formato `feat:`, `fix:`, `docs:`, `chore:`.
