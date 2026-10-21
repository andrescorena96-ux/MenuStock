# MenúStock

App para **vender y comprar productos**: gestión de inventario, categorías, reabastecimiento (restock) e historial de movimientos de stock.

App web estática — HTML, CSS y JavaScript vanilla, sin dependencias ni build step.

---

## Puesta en marcha

El script principal se carga como módulo ES (`<script type="module">`), y los módulos **no funcionan abriendo el archivo con `file://`** (CORS los bloquea). Hay que servirlo por HTTP:

```bash
node dev-server.js
```

Luego abrir <http://localhost:8080>.

> Alternativa: `npx serve` o `python -m http.server` también sirven.

---

## Idioma

La app está **completamente en español**: interfaz, landing, mensajes de error y comentarios del código.

Las únicas palabras en inglés que quedan son identificadores técnicos que no se ven en pantalla (`restockModalContainer`, `parseRestockExpression`, `stockHistory`, etc.).

---

## Estructura

```
MenuStock/
├── index.html      # Estructura del DOM: landing + app + modales
├── home.css        # Sistema visual completo (tokens en :root)
├── home.js         # Lógica de la app (un solo módulo)
├── dev-server.js   # Servidor estático para desarrollo local
├── package.json    # Scripts: npm start / npm test
├── tests/
│   ├── e2e.html    # Prueba end-to-end (monta la app real en el navegador)
│   └── run.js      # Runner: abre la prueba en Edge/Chrome headless
└── .gitignore
```

### `index.html`

Dos vistas dentro del mismo documento:

- `#welcomeSection` — landing page de presentación (se muestra solo la primera vez).
- `#appRoot` — la aplicación en sí. Se muestra/oculta cambiando la clase `hidden`.

### `home.css`

Sistema visual de tipo "libreta de tienda de barrio": oxblood, rust y marigold sobre papel cálido. Todos los colores viven como custom properties en `:root`, así que cambiar la paleta es editar un solo bloque.

Tipografías: **Fraunces** (display) y **Archivo** (texto), cargadas desde Google Fonts.

### `home.js`

Organizado en secciones numeradas:

| Sección | Contenido |
|---|---|
| 1 / 1b / 1c | Referencias al DOM, utilidades de escape, sistema de diálogos |
| 2 | Variables de estado |
| 3 | Persistencia en `localStorage` |
| 3b–3e | Historial de stock, expresiones de reposición, landing |
| 4–5 | Perfiles, gate de contraseña, menú de perfil |
| 5b | Categorías y subcategorías |
| 5c | Compras a proveedores |
| 5d | Exportar / importar datos |
| 6–7 | Render de productos y búsqueda |
| 8–10 | Cuenta, modales, confirmar/cancelar |
| 11 | Modales de inventario (producto, reposición, compra, historial) |
| 12–13 | Render de la cuenta y acciones acumulativas |
| 14 | Event listeners |
| 15 | Inicialización |

---

## Diálogos propios

La app **no usa `prompt()`, `alert()` ni `confirm()` nativos**: bloquean la pantalla, no admiten formato y rompen el diseño. En su lugar hay una capa de diálogos (`#dialogRoot`) con tres funciones que son promesas:

```js
await showAlert({ title, message });            // aviso
await showConfirm({ title, message, danger });  // confirmacion -> true/false
await showPrompt({ title, label, validate });   // pedir un dato -> string o null
```

`validate` recibe el texto escrito y devuelve un mensaje de error, o `null` si está bien. Si devuelve un error, **el diálogo no se cierra** y el mensaje se muestra dentro del panel:

```js
const name = await showPrompt({
    title: "Nueva categoría",
    label: "Nombre de la categoría",
    validate: (value) => value.length === 0 ? "Escribe un nombre." : null
});
```

Se cierran con Escape o haciendo clic en el fondo.

---

## Compras a proveedores

El lado "comprar" de la app: lo que **entra** al negocio, además de lo que sale por venta.

- Vista **Compras** en la cabecera, con el listado de compras registradas.
- **+ Nueva compra**: proveedor (con autocompletado de proveedores anteriores), y una o más líneas de producto con cantidad y precio unitario. El total se calcula en vivo.
- Al registrar la compra, el stock de cada producto **sube** y queda un movimiento `purchase` en el historial de inventario.
- **Anular** una compra devuelve el stock y deja un movimiento `purchaseVoid` en el historial. La compra no se borra: queda marcada como anulada.

---

## Exportar e importar datos

Todo vive en `localStorage`: si se borra el navegador del negocio, se pierde el inventario. Desde el menú del perfil:

- **Exportar datos** → descarga un `.json` con el perfil completo (productos, categorías, compras, historiales).
- **Importar datos** → reemplaza los datos del perfil actual con los del archivo.

**La contraseña no se exporta ni se importa**: es un secreto y debe quedar solo en el dispositivo.

---

## Pruebas

Hay una prueba end-to-end que monta la app real en un navegador headless y maneja la interfaz como lo haría una persona (clics, escritura en campos, elección de opciones, respuestas a los diálogos):

```bash
npm test
```

Levanta su propio servidor en el puerto 8123, abre `tests/e2e.html` en Edge o Chrome headless y lee el resultado del DOM.

Cubre **77 casos**: arranque, landing, sistema de diálogos (incluida la validación), creación de perfil, **escapado de HTML (XSS)**, persistencia del filtro de categoría, ordenamiento numérico de precios, venta, historial de stock, **compras a proveedores** (alta, total en vivo, anular, devolución de stock) y migración de las claves antiguas de `localStorage`. Incluye el modo visible de la barra de acciones y el formulario de alta a pantalla completa.

---

## Modelo de datos

Todo vive en `localStorage`, en la clave `inventoryUsers`. Cada **perfil** es un objeto independiente:

```js
{
  id: "uuid",
  profile: { name: "Mi negocio" },
  password: "texto plano",        // ⚠️ ver "Pendientes"
  storeType: "general",           // general | clothing | other
  clothingConfig: { sizeSystem: "letter", sizeList: ["XS", "M", "L"] },
  products: [],
  restockPreferences: {},         // { productId: packSize }
  historial: [],                  // ventas
  stockHistory: [],               // movimientos de stock (máx. 1000)
  categories: [{ id, name, subcategories: [{ id, name }] }],
  purchases: [{                   // compras a proveedores
    id, fecha, proveedor,
    items: [{ productId, nombre, cantidad, precioUnitario }],
    total, anulada
  }]
}
```

### Claves de `localStorage`

| Clave | Contenido |
|---|---|
| `menuStockUsers` | Todos los perfiles (array) |
| `menuStockCurrentUser` | Id del último perfil usado |
| `menuStockWelcomeSeen` | `"true"` si ya se vio la página de bienvenida |

Las versiones anteriores de la app usaban `inventoryUsers`, `currentInventoryUser` y `creatussinessWelcomeSeen`. La app **migra esos datos automáticamente** la primera vez que se abre y borra las claves viejas.

### Expresiones de reposición

El campo de cantidad acepta sumas y restas. **El primer número usa el empaque elegido**, los siguientes son unidades sueltas:

```
Paquete de 6 · 2 + 16   →  2×6 + 16 = 28 unidades
Caja (x12)   · 3        →  3×12 = 36 unidades
Ninguno      · -3       →  descuenta 3 unidades (sin conversión)
```

La entrada se valida con una expresión regular y se suma término a término: **el texto del usuario nunca se ejecuta como código**.

---

## Estado actual

- [x] Landing page + selección de perfil
- [x] Perfiles con contraseña
- [x] Inventario: alta, búsqueda, filtro por precio/stock
- [x] Categorías y subcategorías
- [x] Reposición con conversiones de empaque
- [x] Historial de movimientos de stock
- [x] Cuenta / venta
- [x] Tienda de ropa: tallas, colores y cantidad por variante
- [x] Diálogos propios (sin `prompt`/`alert`/`confirm` nativos)
- [x] **Compras a proveedores** (entrada de stock, con anulación)
- [x] Exportar / importar datos (respaldo en JSON)
- [ ] Carrito y pedido del cliente final
- [ ] Catálogo público para el cliente
- [ ] Backend y sincronización entre dispositivos
- [ ] Cálculo de costos y utilidad por producto

---

## Pendientes técnicos

1. **Contraseñas en texto plano.** `localStorage` no cifra nada y es legible por cualquiera con acceso al navegador. Mientras sea local, es aceptable; en cuanto haya backend, esto pasa a ser un problema serio.
2. **CSS con mucho `!important`.** Sobre todo en `#modali` y `#modali-content`, donde cada propiedad está forzada. Funciona, pero cualquier ajuste fino se vuelve frágil.
3. **Nombres heredados.** `#modali`, `#modali-content` y `.closing` son restos de versiones anteriores; `.closing` convive con `.show` para el mismo efecto.
4. **Los datos viven solo en este dispositivo.** No hay sincronización: dos Computers con la misma app no ven lo mismo. Exportar/importar es el parche, no la solución.
5. **El historial de ventas no tiene pantalla.** Se guarda (`historial`) pero no se muestra en ninguna parte de la interfaz.

---

## Corregido en la versión actual

| Problema | Solución |
|---|---|
| Los nombres con HTML se ejecutaban (XSS) | `escapeHtml()` en todos los puntos de inyección + `safeImageUrl()` para imágenes |
| Al confirmar una acción se perdía la categoría activa | `refreshProducts()` en vez de `display(products)` |
| El filtro por precio ordenaba como texto (100 antes que 20) | `.sort((a, b) => a.price - b.price)` |
| El historial de ventas guardaba `[object Object]` | Renglones estructurados: `{ id, nombre, precio, cantidad }` |
| Se podía vender más stock del que había | Se valida **antes** de descontar; si no alcanza, la venta se cancela |
| La reposición aplicaba la mitad si una fila estaba mal | Se validan todas las filas y solo después se aplica |
| Perfiles viejos sin `products` reventaban la app | Guards al cargar cada campo del perfil |
| La barra de acciones no era accesible con teclado | `<button>` reales con iconos y jerarquía visual |
| No se veía en qué modo estabas (borrar / cambiar precio) | Aviso de modo, botón marcado, tarjetas resaltadas, `Esc` para salir |
| El modo se quedaba pegado al cambiar de vista o perfil | Se cancela solo en ambos casos |
| El formulario de alta salía recortado en una esquina | Tarjeta centrada de 800 px con rejilla de dos columnas |
| Un `<header>` dentro del formulario heredaba la cabecera oxblood de la app | El selector `header` global se acotó a `#appRoot > header` |
| La barra de acciones quedaba bajo el pliegue | La app ocupa el alto del viewport y la grilla se estira |
| `prompt()`/`alert()`/`confirm()` nativos bloqueaban la pantalla | Capa de diálogos propios con validación en línea |

---

## Licencia

MIT

