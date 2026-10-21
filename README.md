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
| 1 | Referencias al DOM |
| 2 | Variables de estado |
| 3 | Persistencia en `localStorage` |
| 3b–3e | Historial de stock, expresiones de restock, landing |
| 4–5 | Perfiles, gate de contraseña, menú de perfil |
| 5b | Categorías y subcategorías |
| 6–7 | Render de productos y búsqueda |
| 8–10 | Cuenta, modales, confirmar/cancelar |
| 11 | Modales de inventario (producto, restock, historial) |
| 12–13 | Render de la cuenta y acciones acumulativas |
| 14 | Event listeners |
| 15 | Inicialización |

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
2. **XSS.** Nombres de productos, categorías y perfiles se inyectan con `innerHTML`. Un nombre como `<img src=x onerror=...>` se ejecuta. Hay que escapar o construir con `textContent`.
3. **Filtrado por precio sin comparador.** `.sort()` sin `compareFn` ordena lexicográficamente, no numéricamente.
4. **Vista de categoría se pierde al confirmar.** `display(products)` al final de `confirmButton()` ignora el filtro de categoría activo.

---

## Licencia

Por definir.
