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
| 1 / 1b | Referencias al DOM y utilidades de escape |
| 2 | Variables de estado |
| 3 | Persistencia en `localStorage` |
| 3b–3e | Historial de stock, expresiones de reposición, landing |
| 4–5 | Perfiles, gate de contraseña, menú de perfil |
| 5b | Categorías y subcategorías |
| 6–7 | Render de productos y búsqueda |
| 8–10 | Cuenta, modales, confirmar/cancelar |
| 11 | Modales de inventario (producto, reposición, historial) |
| 12–13 | Render de la cuenta y acciones acumulativas |
| 14 | Event listeners |
| 15 | Inicialización |

---

## Pruebas

Hay una prueba end-to-end que monta la app real en un navegador headless y maneja la interfaz como lo haría una persona (clics, escritura en campos, elección de opciones):

```bash
npm test
```

Levanta su propio servidor en el puerto 8123, abre `tests/e2e.html` en Edge o Chrome headless y lee el resultado del DOM.

Cubre 28 casos: arranque, creación de perfil, **escapado de HTML (XSS)**, persistencia del filtro de categoría, ordenamiento numérico de precios, venta, historial de stock y migración de las claves antiguas de `localStorage`.

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
  categories: [{ id, name, subcategories: [{ id, name }] }]
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
- [x] Restock con conversiones de empaque
- [x] Historial de movimientos de stock
- [x] Cuenta / venta
- [x] Tienda de ropa: tallas, colores y cantidad por variante
- [ ] Carrito / módulo de compra (el lado "comprar" de la app)
- [ ] Backend y sincronización entre dispositivos
- [ ] Exportar / importar inventario

---

## Pendientes técnicos

1. **Contraseñas en texto plano.** `localStorage` no cifra nada y es legible por cualquiera con acceso al navegador. Mientras sea local, es aceptable; en cuanto haya backend, esto pasa a ser un problema serio.
2. **`prompt()` / `alert()` / `confirm()` nativos.** Bloquean la pantalla y se ven fuera de tono con el resto de la app. Deberían ser modales propios de MenúStock.
3. **CSS con mucho `!important`.** Sobre todo en `#modali` y `#modali-content`, donde cada propiedad está forzada. Funciona, pero cualquier ajuste fino se vuelve frágil.
4. **Nombres heredados.** `#modali`, `#modali-content` y `.closing` son restos de versiones anteriores; `.closing` convive con `.show` para el mismo efecto.
5. **El lado "comprar" de la app no existe.** Todo el flujo es del lado del negocio: inventar, reponer y cobrar.

---

## Corregido en la versión actual

| Problema | Solución |
|---|---|
| Los nombres con HTML se ejecutaban (XSS) | `escapeHtml()` en todos los puntos de inyección + `safeImageUrl()` para imágenes |
| Al confirmar una acción se perdía la categoría activa | `refreshProducts()` en vez de `display(products)` |
| El filtro por precio ordenaba como texto (100 antes que 20) | `.sort((a, b) => a.price - b.price)` |
| El historial de ventas guardaba `[object Object]` | Renglones estructurados: `{ id, nombre, precio, cantidad }` |
| Se podía vender más stock del que había | Se valida **antes** de descontar; si no alcanza, la venta se cancela |
| Perfiles viejos sin `products` reventaban la app | Guards al cargar cada campo del perfil |
| La barra de acciones no era accesible con teclado | `role="button"` + `tabindex` + activación con Enter/Espacio |
| Los `console.log` de debug spampeaban la consola | Eliminados |
| La regla móvil del modal de reposición no aplicaba | Selector corregido (tenía menos especificidad que la base) |
| `height: 70em` en el overlay | `height: 100%` |

---

## Licencia

MIT
