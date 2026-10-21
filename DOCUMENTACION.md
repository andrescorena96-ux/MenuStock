# MenúStock — Documentación completa

> App para vender y comprar productos: inventario, categorías, reposición, compras a proveedores e historial de stock.
> Versión 0.1.0 · repositorio `andrescorena96-ux/MenuStock`

---

## 1. Qué es

**MenúStock** es una aplicación web de gestión de inventario para pequeños comercios. Sirve para llevar el control de qué se tiene, cuánto entró, cuánto salió y cuánto se vendió, sin depender de un servidor ni de una conexión a internet.

Está pensada para el dueño de una tienda de barrio o de un negocio pequeño que hoy lleva el inventario en una libreta, en un cuaderno o en la memoria, y que quiere un sistema simple que le devuelva tiempo en vez de quitárselo.

La app se organiza alrededor de **perfiles**: cada perfil es un negocio independiente con su propio inventario, sus propias categorías, su historial y su contraseña. En un mismo dispositivo se pueden manejar varios negocios sin que se mezclen los datos.

Suena sencilla, y lo es a propósito. La interfaz está diseñada para que un cajero o un dueño la use sinmanual ni capacitación: botones grandes, contraste alto, cero tecnicismos y atajos de teclado en las acciones repetitivas.

---

## 2. Qué problema resuelve

| Situación de hoy | Cómo lo resuelve MenúStock |
|---|---|
| "¿Cuántas gaseosas me quedan?" | Stock visible en la tarjeta de cada producto, actualizado al instante |
| Anotar en la libreta lo que llegó del proveedor | **Reponer** con conversión de empaque y **Compras** registradas con proveedor, cantidad y precio |
| "¿En cuánto vendí hoy?" | Cuenta (bill) con total y registro de cada venta en el historial |
| "No sé de dónde salió este lote" | **Historial de inventario**: cada movimiento queda con fecha, acción y stock resultante |
| "¿Y si el cliente me devuelve algo?" | Ajuste manual con empaque "Ninguno" (unidades directas) |
| "Perdí el inventario al cambiar de celular" | **Exportar / importar datos** en `.json` |
| "No quiero que mi sobrino vea mis ganancias" | Contraseña por perfil, solicitada al abrir la app |

---

## 3. Cómo se ve y cómo se siente

**Identidad visual:** "libreta de tienda de barrio". Papel tibio como base, con oxblood (rojo oscuro), rust (rojo tierra) y marigold como acentos. El encabezado y la barra de acciones van en oxblood oscuro como anclas; la cuadrícula de productos y el buscador viven sobre papel claro; las hojas de reposición, compras e historial son superficies oscuras aparte, con textura propia.

**Tipografías:** **Fraunces** (display — marca, títulos de sección y cifras destacadas) y **Archivo** (todo lo demás). Se cargan desde Google Fonts.

**Tokens de color:** todos viven como custom properties en `:root`, así que cambiar la paleta entera es editar un solo bloque. Hay tokens para papel, tinta, los tres rojos, beige, peligro, éxito y los del panel oscuro.

**Responsive:** la app está pensada primero para el celular (es donde se usa en una tienda) y escala a escritorio. Hay puntos de corte en 700 px y 430 px. En móvil la grilla de productos baja a 2 columnas y los formularios de compras se reorganizan.

**Accesibilidad:** foco visible en todos los controles, `prefers-reduced-motion` respetado, navegación por teclado en las acciones que antes no la tenían (barra de acciones y tarjetas de producto), `aria` en los diálogos modales, y `alt` real en las imágenes de producto.

---

## 4. Estructura del proyecto

```
MenuStock/
├── index.html        436 líneas   ·  23 KB   Estructura del DOM
├── home.css        2.468 líneas   ·  65 KB   Sistema visual completo
├── home.js         3.009 líneas   · 133 KB   Toda la lógica (78 funciones)
├── dev-server.js      52 líneas   ·   2 KB   Servidor estático de desarrollo
├── package.json       17 líneas   ·   0 KB   Scripts npm
├── README.md         172 líneas   ·  10 KB   Guía rápida
├── DOCUMENTACION.md              ·          Este documento
├── .gitignore        29 líneas   ·   0 KB
└── tests/
    ├── e2e.html     388 líneas   ·  20 KB   Prueba end-to-end
    └── run.js       113 líneas   ·   4 KB   Runner (Edge/Chrome headless)

Total: 9 archivos · 6.684 líneas · ~257 KB
```

### `index.html` — la estructura

Un solo documento con **dos vistas** que se alternan:

- **`#welcomeSection`** — la landing. Se muestra solo la primera vez que se abre la app (o cuando el usuario vuelve con el botón "🏠 Inicio"). No toca los datos: solo se interpone.
- **`#appRoot`** — la aplicación. Se muestra y oculta cambiando la clase `hidden`.

Dentro de `#appRoot` viven el encabezado, la pantalla de perfiles, el gate de contraseña, el menú de perfil, y el `<main>` con las cuatro vistas (productos, categorías, compras, y los modales de inventario).

Además, **fuera** de `#appRoot` está la capa de diálogos (`#dialogRoot`), para que nunca choque con los modales de inventario, y el `<input type="file">` oculto del importador.

El HTML tiene **71 identificadores**. Los `id` y las clases son el contrato entre el HTML, el CSS y el JS: cambiarlos rompe la app, por eso están documentados y no se tocan a la ligera.

### `home.css` — el sistema visual

Organizado en bloques rotulados por sección, en este orden: base → cabecera → estructura principal → panel de búsqueda → campos → grilla de productos → tarjeta de producto → barra de acciones → botones compartidos → modal de acciones → formulario de alta → modal de reposición → lista y campos de reposición → panel de cuenta → pantalla de perfiles → botón y menú de perfil → accesibilidad → oculto → movimiento reducido → responsive → **añadidos**: migas de pan, vista de categorías, capa del formulario de ropa, ayuda y vista previa del cálculo, historial de inventario, navegación del encabezado, landing, diálogos, compras a proveedores.

### `home.js` — la lógica

Un solo módulo ES, organizado en 28 secciones numeradas:

| Sección | Contenido |
|---|---|
| 1 | Referencias al DOM |
| 1b | Utilidades de escape de texto y validación de URLs |
| 1c | Sistema de diálogos |
| 2 | Variables de estado |
| 3 | Persistencia en `localStorage` |
| 3b | Historial de stock |
| 3c | Expresiones de reposición |
| 3d | Ayudantes del panel de reposición |
| 3e | Bienvenida / landing |
| 4 | Pantalla de selección de perfil |
| 4b | Gate de contraseña |
| 5 | Menú de perfil (barra superior) |
| 5b | Categorías y subcategorías |
| 5c | Compras a proveedores |
| 5d | Exportar / importar datos |
| 6 | Render de productos |
| 7 | Búsqueda y filtros |
| 8 | Cuenta / historial |
| 9 | Ayudantes de modales |
| 10 | Confirmar / cancelar acciones |
| 11 | Modales de inventario (producto, reposición, compra, historial) |
| 12 | Render de la cuenta |
| 13 | Acciones acumulativas (cuenta, cambio de precio, borrado) |
| 14 | Event listeners |
| 15 | Inicialización |

**78 funciones** de primer nivel, de `escapeHtml()` a `wasWelcomeSeen()`.

---

## 5. Cómo se usa (recorrido completo)

### 5.1 Primera vez

1. Se abre la app y aparece la **landing**: hero con la marca, el eslogan, y tres botones (*Empezar*, *Conoce MenúStock*, *Nuestra historia / Orígenes*), luego las secciones de About, Misión, Historia, Lo que ofrece, Pensado para tu negocio, Transición y el mensaje final.
2. Se presiona **Empezar** → la landing se oculta y aparece la **pantalla de perfiles**.
3. La app crea dos perfiles de ejemplo (*Juan*, *María*) para que se pueda explorar sin datos previos.
4. Se presiona **+ Crear perfil** → se abre el **selector de tipo de negocio**.

### 5.2 Crear un perfil

El alta de perfil es un flujo de pasos:

1. **Tipo de negocio**: *Tienda General*, *Tienda de Ropa* u *Otro*.
2. Si es *Tienda de Ropa*, se pregunta el **sistema de tallas**:
   - *Tallas de letra* → XS, S, M, L, XL, XXL (automático)
   - *Tallas numéricas*, *Tallas de calzado*, *Tallas personalizadas* → el usuario escribe su lista separada por comas
3. **Nombre** del perfil.
4. **Contraseña** — obligatoria. Si se cancela, no se crea el perfil.

Una tienda de ropa nueva además nace con dos categorías sugeridas (*Hombre*, *Mujer*), cada una con subcategorías, que el usuario puede renombrar, borrar o ampliar.

### 5.3 Entrar

- Perfil **sin contraseña** → entra directo.
- Perfil **con contraseña** → aparece el *gate de contraseña* antes del inventario, también al recargar la app (para que "protegido" signifique algo de verdad).

### 5.4 Navegación

El encabezado tiene: **🏠 Inicio**, **Reponer**, **Productos**, **Categorías**, **Compras**, **Historial**, y a la derecha el **botón de perfil**.

El botón de perfil abre un menú con: *Cambiar perfil*, *Cambiar nombre*, *Exportar datos*, *Importar datos*, *Cerrar*.

### 5.5 El día a día

**Agregar producto** (barra inferior) → nombre, precio, URL de imagen, stock inicial, categoría y subcategoría. En tienda de ropa, además: tipo de variante, tallas, colores y cantidad por variante, y campos opcionales de temporada, colección, serie y proveedor.

**Buscar** → por nombre, precio máximo, precio mínimo o cantidad en stock. El filtro respeta la categoría en la que se esté.

**Reponer** → se abre una hoja oscura con una fila por producto: empaque, cantidad y vista previa del resultado en vivo. Se escribe con expresiones (`2 + 16`, `-3`, `10 - 2`).

**Cobrar** → se hace clic en las tarjetas de producto y se arma la cuenta. El panel inferior muestra cada renglón con su cantidad y permite restar o quitar. Al confirmar, se descuenta el stock y queda la venta registrada.

**Comprar** → vista *Compras* → *+ Nueva compra* → proveedor y líneas de producto → el stock sube y queda registrado.

---

## 6. Funcionalidades, en detalle

### 6.0 Control del inventario: mínimos, mermas y recetas

Cuatro cosas que un dueño de tienda necesita y que antes no existían.

**Stock mínimo y estado.** Cada producto puede tener un **stock mínimo**: el nivel por debajo del cual hay que reponer. A partir de él la app calcula un estado de tres niveles:

| Estado | Cuándo | Color |
|---|---|---|
| **En stock** | hay más que el mínimo | 🟢 verde |
| **Por reponer** | entre el mínimo y 1,5× el mínimo | 🟡 amarillo |
| **Crítico** | por debajo del mínimo, o agotado | 🔴 rojo |

El estado se ve en la tarjeta (punto de color + etiqueta) y hay un **filtro por estado** en el panel de búsqueda para ver solo lo crítico.

**Mermas y desperdicios.** El menú ⋮ de la tarjeta tiene **Registrar merma**: se descuenta stock sin que haya venta, con un motivo (daño, caducidad, error de preparación, merma de cocina u otro). Queda registrado en el historial como movimiento `merma`, así que se puede saber dónde se está perdiendo el inventario.

**Unidades de medida.** Cada producto lleva su unidad: unidades, kg, g, L, ml, cajas o paquetes. Se muestra junto al stock y en el formulario de merma.

**Costo de compra y margen.** Cada producto puede llevar su **costo unitario de compra**. Con el precio de venta, la app calcula el **margen** y lo muestra en la tarjeta: verde si es ≥ 30 %, amarillo si ≥ 10 %, rojo por debajo.

**Escandallo (recetas).** Un producto puede ser un **preparado** armado con insumos del inventario:

- Se marca *"Es una receta"* en el formulario y se eligen los ingredientes con su cantidad.
- **El stock de la receta se calcula**: si la receta lleva 200 g de carne y hay 1 000 g, se pueden preparar 5 hamburguesas.
- **Al venderla se descuentan los insumos** automáticamente, cada uno con su movimiento en el historial.
- El costo de la receta (y su margen) se calculan con los costos de los insumos.

### 6.1 Barra de acciones

La barra inferior es **mínima**: una sola acción, en una tira delgada sin el bloque vinotinto gigante de antes.

- **Agregar producto** — botón principal de 44 px, alineado a la derecha, en terracota, con icono ＋.

El objetivo es **maximizar el espacio para el catálogo**. Las acciones específicas de cada producto ya no viven en la barra, sino **en la propia tarjeta**.

**Menú ⋮ por tarjeta.** Cada tarjeta tiene un botón de tres puntos en su esquina superior derecha (aparece al pasar el mouse; en pantallas táctiles siempre está visible). Al abrirlo sale un menú con:

- ✏️ **Editar producto** — abre el formulario completo del producto.
- 🏷️ **Cambiar precio** — abre un diálogo con el precio nuevo.
- 🗑️ **Eliminar producto** — pide confirmación y lo borra.

El clic en la tarjeta sigue significando lo de siempre: **sumar el producto a la cuenta**.

**Selección múltiple.** Cada tarjeta tiene una casilla en su esquina superior izquierda. Al marcar una o más aparece una **barra flotante** abajo con el número de productos marcados y las acciones *Editar*, *Cambiar precio*, *Eliminar* y *Cancelar*. Sirve para cambiar el precio de veinte productos o borrar cinco de un tirón.

Mientras el panel de la cuenta está abierto, la barra se oculta: el panel ocupa su lugar y tiene sus propios botones.

### 6.2 Editar un producto

Un producto se puede editar en cualquier momento: su **categoría y subcategoría** son los campos que más cambian, porque el negocio se reorganiza.

**Cómo se usa:**

1. Se pulsa **Editar producto** en la barra. El modo se activa y el aviso dice *"Estás editando productos. Haz clic en el producto que quieras modificar."*
2. Se hace clic en el producto. Se abre el **mismo formulario del alta**, pero con todos los datos ya puestos: nombre, precio, imagen, stock, categoría, subcategoría y —en tienda de ropa— las tallas, colores y cantidades.
3. Se cambia lo que haga falta y se pulsa **Guardar cambios**.

**Detalles importantes:**

- El selector de **subcategoría se habilita solo** si la categoría elegida tiene subcategorías; si no, queda en "Sin subcategoría" y deshabilitado.
- Al guardar se informa **qué cambió**: *"Se actualizó «Pepsi». Cambios: categoría, subcategoría, stock."*
- **El modo sigue activo** después de guardar, para poder corregir varios productos seguidos sin volver a pulsar el botón.
- Si se mueve el stock, se registra como **ajuste** en el historial de movimientos. Ningún cambio de inventario pasa sin rastro, ni siquiera al editar.
- Las **variantes de ropa** se recuperan tal como estaban: las tallas marcadas, las cantidades por talla y un bloque por cada color.
- Si el producto **se muda de categoría**, deja de verse en la vista actual. En ese caso el aviso lo dice y ofrece un botón **«Ver en «Bebidas»»** que lleva a la categoría nueva. Sin esto, el producto parecía haberse borrado.
- Si la **búsqueda está puesta** y el producto nuevo no entra en ella, el aviso lo explica: el filtro es lo que lo está ocultando.
- Poner la **imagen de relleno** en un producto que no tenía imagen no se reporta como cambio.

### 6.3 Lista vacía

Cuando la lista no tiene nada que mostrar, no se deja el espacio en blanco: aparece un recuadro con el motivo.

| Situación | Mensaje |
|---|---|
| No hay productos en general | Todavía no hay productos registrados. Usa «Agregar producto» para empezar. |
| La categoría está vacía | «Bebidas» todavía no tiene productos. |
| Sin categoría asignada | No hay productos sin categoría. |
| Hay una búsqueda puesta | Ningún producto coincide con «Pepsi». |

Esta lista se respeta también al **guardar**: la búsqueda activa no se pierde, así que el usuario sigue viendo lo que estaba buscando.
- Los productos creados antes de que existiera el campo `variantMode` deducen su modo a partir de las variantes que tienen.

### 6.3 Formulario de alta de producto

Se abre como una **tarjeta centrada** sobre el fondo del modal:

| Elemento | Medida |
|---|---|
| Tarjeta | `max-width: 800px`, `border-radius: 20px`, sombra suave |
| Padding interno | `2.5rem` por lado |
| Título | `1.75rem`, Fraunces, color oxblood |
| Subtítulo | `0.9rem`, tinta suave, sin bloque de fondo |
| Campos | `height: 48px`, `border-radius: 12px`, fondo crema, borde tan |
| Botones | abajo a la derecha, `border-radius: 24px` |

Los seis campos van en una **rejilla de dos columnas**:

```
Nombre tu producto   |  Ingresa precio
Imagen URL           |  Stock inicial
Categoría            |  Subcategoría
```

En móvil la rejilla pasa a una columna y los botones ocupan el ancho completo.

En tienda de ropa, debajo del bloque principal aparecen los **4 modos de variante** (en una sola fila), las casillas de tallas y los detalles opcionales (temporada, colección, serie, proveedor).

### 6.4 Crear un perfil

El alta de perfil es un flujo de pasos:

1. **Tipo de negocio** — *Tienda General*, *Tienda de Ropa* u *Otro*.
2. Si es *Tienda de Ropa*, el **sistema de tallas**: *letra* (XS–XXL automático), *numérica*, *de calzado* o *personalizada* (en estos tres el usuario escribe su lista separada por comas).
3. **Formulario del perfil**: nombre del perfil, nombre del negocio (opcional), **color** y **contraseña (opcional)**.

El formulario es un diálogo propio de MenúStock, no los diálogos del navegador. Eligiendo un color se le da personalidad al perfil: la inicial aparece en un círculo de ese color en la lista de perfiles, en el botón de la cabecera y en el menú de perfil.

**La contraseña ahora es opcional.** Si se deja vacía, el perfil se abre sin pedir contraseña — útil cuando el negocio comparte el dispositivo y el dueño no quiere que se pregunte la clave cada vez.

Una tienda de ropa nueva además nace con dos categorías sugeridas (*Hombre*, *Mujer*), cada una con subcategorías, que el usuario puede renombrar, borrar o ampliar.

### 6.5 Perfiles y contraseñas

- Multiperfil en un mismo dispositivo, cada uno con datos completamente aislados.
- Contraseña por perfil, guardada en texto plano (ver *Límites*).
- El gate de contraseña aparece tanto al cambiar de perfil como al recargar la app.
- Se puede renombrar un perfil (con validación de duplicados) o cambiar de perfil en cualquier momento.
- Al crear el perfil se elige el **tipo de negocio**, que adapta la app: una tienda de ropa habilita tallas, colores y variantes.

### 6.6 Inventario

- Alta de productos con nombre, precio, imagen (URL), stock inicial, categoría y subcategoría.
- **Imagen por URL** con validación: solo se aceptan `http(s)` y `data:image/*`. Si la URL no es válida o falta, se usa una imagen de relleno.
- Si el producto no tiene categoría, aparece en la tarjeta "Sin categoría" de la vista de categorías (sirve para los productos que ya existían antes de las categorías).
- La grilla de producto muestra: imagen, nombre, precio, stock, etiqueta de categoría y —en ropa— resumen de tallas y colores.

### 6.7 Búsqueda y filtros

Cuatro modos, conmutables desde un desplegable: **nombre**, **precio máximo**, **precio mínimo**, **cantidad en stock**. Al cambiar de modo el campo se reconfigura solo (tipo `text` o `number`) y el placeholder se adapta. La búsqueda se aplica sobre los productos **visibles en la categoría actual**, no sobre todo el catálogo.

### 6.8 Categorías y subcategorías

- Árbol de dos niveles: categoría → subcategorías.
- Crear, renombrar y eliminar, tanto categorías como subcategorías.
- Cada tarjeta muestra el conteo de productos.
- **Al eliminar una categoría, los productos no se borran**: quedan como "Sin categoría". Al eliminar una subcategoría, los productos permanecen en su categoría. Nunca se pierde inventario por reorganizar.
- **Migas de pan** para volver a la raíz o a la categoría padre.

### 6.9 Reposición (Restock)

El módulo más elaborado de la app, porque el stock de un negocio real no siempre entra por unidades.

**Empaques disponibles:**

| Opción | Conversión |
|---|---|
| Unidad (x1) | 1 número = 1 unidad |
| Paquete de 6 (x6) | 1 número = 6 unidades |
| Caja (x12) | 1 número = 12 unidades |
| Caja (x24) | 1 número = 24 unidades |
| Ninguno | 1 número = 1 unidad (ajuste manual) |

**Expresiones.** El campo de cantidad acepta sumas y restas:

```
Paquete de 6 · 2 + 16   →  2×6 + 16 = 28 unidades
Caja (x12)   · 3        →  3×12 = 36 unidades
Ninguno      · -3       →  descuenta 3 unidades (sin conversión)
```

**La regla:** el **primer** número usa el empaque elegido; los siguientes son unidades sueltas. La entrada se valida con una expresión regular y los términos se suman a mano — **el texto del usuario nunca se ejecuta como código**.

**Extras:**
- **Vista previa en vivo** de cuántas unidades van a entrar, con color según sea positiva, negativa o inválida.
- **Teclado**: Enter sobre el empaque salta a la cantidad; Enter sobre la cantidad salta al siguiente producto visible; en el último, vuelve al buscador.
- **Filtro** por nombre dentro del panel.
- **Preferencia de empaque por producto**: se recuerda el empaque usado la última vez.
- **Validación en dos pasos**: primero se revisan todas las filas y solo después se aplica nada. Antes se modificaba sobre la marcha y una fila inválida dejaba la mitad del cambio aplicada.

### 6.10 Proveedores y pedido de reposición

En la vista **Compras** hay dos botones nuevos:

- **Proveedores** — abre el directorio. Se crean, renombran y eliminan; cada uno puede tener teléfono. Los productos se asignan a un proveedor desde el formulario (campo *Proveedor*). Si borras un proveedor, sus productos quedan sin proveedor en vez de desaparecer.
- **Generar pedido** — arma el pedido de reposición con lo que está por debajo del mínimo, **agrupado por proveedor**, y lo entrega como texto listo para copiar y mandar por WhatsApp o email. Al copiar se copia el texto; si el navegador no deja usar el portapapeles, el texto queda seleccionado para copiarlo a mano.

El botón **+ Generar compra con estos** de la lista de reorden abre directamente el formulario de compra con los productos que hay que reponer y la cantidad sugerida para dejar el stock por encima del mínimo.

### 6.11 Compras a proveedores

El lado "comprar": lo que **entra** al negocio, además de lo que sale por venta.

- **Vista Compras** en la cabecera, con el listado de compras registradas.
- **Alta de compra**: proveedor (con autocompletado de los proveedores ya usados) y una o más líneas de producto con cantidad y precio unitario. El total se calcula **en vivo** mientras se escribe.
- Al registrar: el stock de cada producto **sube** y queda un movimiento `purchase` en el historial de inventario.
- **Detalle**: cada compra se puede abrir en un diálogo con su fecha, sus renglones y su total.
- **Anular**: devuelve el stock y deja un movimiento `purchaseVoid`. La compra **no se borra** — queda marcada como anulada, para no perder la trazabilidad.

### 6.12 Cuenta y venta

- Se arma haciendo clic en las tarjetas de producto.
- El panel inferior (panel de cuenta) muestra cada renglón con cantidad, precio y subtotal, más el total general.
- Botón **−** para restar unidades; botón **×** para quitar el renglón.
- Al confirmar: se descuenta el stock, se registra la venta y se guarda un movimiento `sale` en el historial de inventario.
- **Validación de stock antes de cobrar**: si no hay unidades suficientes, la venta se cancela y se dice exactamente qué producto falta y cuántas unidades. El inventario nunca queda en negativo.
- El historial de ventas guarda renglones estructurados (`id`, `nombre`, `precio`, `cantidad`), total y fecha.

### 6.13 Historial de inventario

Registro cronológico de **todo** movimiento de stock, del más reciente al más antiguo.

| Acción | Cuándo |
|---|---|
| Producto creado | Al dar de alta un producto con su stock inicial |
| Reposición | Entrada por empaque |
| Ajuste manual | Entrada con empaque "Ninguno" |
| Venta | Salida por venta |
| Producto eliminado | Registro de cuánto stock se fue con el producto |
| Compra a proveedor | Entrada por compra |
| Compra anulada | Devolución por anulación |

Cada movimiento guarda: fecha, acción, delta (+28 / −3), **stock resultante** y una nota con el detalle (por ejemplo, `Paquete de 6 (x6) · 2 + 16`). Trazable con filtro por producto.

El historial **no inventa el pasado**: el stock que ya existía antes de activar esta función no aparece. Cada movimiento registra el stock *resultante*, así que la cadena es verificable de punta a punta.

Se conservan hasta **1.000 movimientos** por perfil, y los más antiguos se descartan para que `localStorage` no crezca sin límite.

### 6.14 Tienda de ropa: variantes

Un producto de ropa puede manejarse de cuatro maneras:

| Modo | Qué hace |
|---|---|
| Artículo único | Stock simple, sin variantes |
| Misma cantidad por talla | Se eligen tallas y una cantidad para todas |
| Cantidad distinta por talla | Se eligen tallas y se asigna una cantidad a cada una |
| Colores y tallas | Se agregan bloques de color, cada uno con sus tallas y cantidades |

El stock total del producto es la suma de sus variantes. La tarjeta muestra un resumen (`Tallas: S, M, L · Colores: Negro, Blanco`).

### 6.15 Exportar e importar datos

Todo vive en `localStorage`: si se borra el navegador del negocio, se pierde el inventario.

- **Exportar** → descarga un `.json` con el perfil completo: productos, categorías, compras, historial de stock, historial de ventas, preferencias de empaque y configuración de ropa.
- **Importar** → reemplaza los datos del perfil actual con los del archivo, previa confirmación.
- **La contraseña nunca se exporta ni se importa**: es un secreto y debe quedarse solo en el dispositivo.

### 6.16 Sistema de diálogos

La app **no usa `prompt()`, `alert()` ni `confirm()` nativos**: bloquean la pantalla, no admiten formato y rompen el diseño. Hay una capa propia con tres funciones que son promesas:

```js
await showAlert({ title, message });            // aviso
await showConfirm({ title, message, danger });  // confirmación -> true / false
await showPrompt({ title, label, validate });   // pedir un dato -> string o null
```

`validate` recibe lo que se escribió y devuelve un mensaje de error, o `null` si está bien. **Si devuelve un error, el diálogo no se cierra** y el mensaje aparece dentro del panel — por ejemplo, "Ya existe una categoría con ese nombre".

Se cierran con **Escape** o haciendo clic en el fondo. El foco va solo al primer campo. Los diálogos de confirmación destructiva se pintan en color de peligro.

### 6.17 Landing page

Ocho secciones: hero, sobre nosotros, misión, historia, lo que ofrece, pensado para tu negocio, transición y mensaje final.

Se muestra solo la primera vez (se guarda un flag en `localStorage`). El botón *🏠 Inicio* de la cabecera permite volver a verla sin cerrar sesión ni perder el estado.

---

## 7. Modelo de datos

Todo vive en `localStorage`, bajo la clave `menuStockUsers`, que guarda un **array de perfiles**.

```js
{
  id: "uuid",
  profile: { name: "Mi Tienda" },
  password: "texto plano",              // ⚠️ ver Límites
  storeType: "general",                 // general | clothing | other
  clothingConfig: {                     // solo si storeType === "clothing"
    sizeSystem: "letter",               // letter | numeric | shoe | custom
    sizeList: ["XS", "S", "M", "L", "XL", "XXL"]
  },
  products: [{
    id: "g-1723456789",
    name: "Gaseosa 1.5L",
    price: 2800,
    quantity: 48,
    image: "https://...",
    category: "uuid-de-categoria" | null,
    subcategory: "uuid-de-subcategoria" | null,
    createdIn: "2026-10-20T15:04:05.000Z",
    variants: [{ size, color, quantity }] | null,   // solo ropa
    season, collection, series, supplier            // solo ropa
  }],
  restockPreferences: { "productId": 6 },   // empaque preferido por producto
  historial: [{                             // ventas
    id, venta: [{ id, nombre, precio, cantidad }], total, fecha
  }],
  stockHistory: [{                          // movimientos de stock (máx. 1.000)
    id, productId, productName, date, action, change, resultingStock, unit
  }],
  categories: [{ id, name, subcategories: [{ id, name }] }],
  purchases: [{                             // compras a proveedores
    id, fecha, proveedor,
    items: [{ productId, nombre, cantidad, precioUnitario }],
    total, anulada
  }]
}
```

### Claves de almacenamiento

| Clave | Contenido |
|---|---|
| `menuStockUsers` | Todos los perfiles (array) |
| `menuStockCurrentUser` | Id del último perfil usado |
| `menuStockWelcomeSeen` | `"true"` si ya se vio la landing |

### Migración

Las versiones anteriores de la app usaban `inventoryUsers`, `currentInventoryUser` y `creatussinessWelcomeSeen`. La app **migra esos datos automáticamente** la primera vez que se abre y borra las claves viejas. Los perfiles que no tengan `products`, `restockPreferences`, `historial`, `stockHistory`, `categories` o `purchases` reciben valores por defecto, para que un perfil viejo nunca reviente la app.

---

## 8. Arquitectura técnica

### Stack

**HTML + CSS + JavaScript vanilla. Sin dependencias, sin build step, sin framework.** Se clone, se abre `index.html` con un servidor estático y funciona.

### Por qué `type="module"`

El script principal se carga como módulo ES para que el navegador lo ejecute **diferido** (con el DOM ya listo) y para poder importar más adelante. El efecto secundario: los módulos están bloqueados por CORS en `file://`, así que la app **necesita servirse por HTTP**.

```bash
node dev-server.js     # o: npm start   ->  http://localhost:8080
```

### Seguridad

- **Escapado de HTML**: todo texto que escribe el usuario (nombres de productos, categorías, perfiles, proveedores) pasa por `escapeHtml()` antes de entrar al DOM. Sin esto, un nombre como `<img src=x onerror=...>` se ejecutaría.
- **Validación de URLs de imagen**: `safeImageUrl()` solo deja pasar `http(s)` y `data:image/*`.
- **La entrada de restock nunca se evalúa**: se valida con una expresión regular y se suman los términos a mano. No hay `eval` ni `new Function` en ninguna parte del código.
- **Límite de historial**: 1.000 movimientos por perfil para que `localStorage` no crezca sin control.

### Accesibilidad

- Foco visible en todos los controles (`focus-visible` con contorno de 3 px).
- `prefers-reduced-motion` respetado: las transiciones se casi anulan.
- La barra de acciones y las tarjetas de producto son `<li>` con `role="button"` y `tabindex="0"`, activables con Enter o Espacio.
- Los diálogos son `role="dialog"` con `aria-modal` y `aria-labelledby`.
- Los `alt` de las imágenes de producto son el nombre del producto.

### Rendimiento

- La lista de productos se re-renderiza completa en cada cambio. Es instantáneo para inventarios de tienda (decenas o cientos de productos); con miles habría que virtualizar.
- Los eventos del panel de reposición se registran **una sola vez** sobre el contenedor, no en cada apertura del modal — si no, se acumularían y el Enter saltaría varios campos a la vez.
- El historial se filtra en memoria (1.000 registros máximo).

---

## 9. Pruebas

Hay una prueba end-to-end real: monta la app en un navegador headless y la maneja **como lo haría una persona** — clics, escritura en campos, elección de opciones, respuestas a los diálogos.

```bash
npm test
```

Levanta su propio servidor en el puerto 8123, abre `tests/e2e.html` en Edge o Chrome headless y lee el resultado del DOM.

**122 casos**, todos en verde:

- Arranque: carga del módulo, perfiles por defecto, landing, entrada a la app
- Sistema de diálogos: apertura, validación que impide confirmar un valor vacío, encadenado de diálogos
- Creación de perfil con nombre y contraseña
- **XSS**: un nombre con HTML malicioso no se ejecuta y se escapa en el DOM
- Categorías: alta, listado, conteos
- **Filtro de categoría**: sigue activo después de confirmar una acción
- **Ordenamiento numérico** del filtro por precio
- Venta: apertura de la cuenta, total, descuento de stock, historial estructurado
- Historial de stock: movimientos con acción y delta
- **Compras**: vista, estado vacío, formulario, total en vivo, agregar y quitar líneas, alta, suma de stock, detalle, anulación y devolución de stock
- **Barra de acciones**: modo visible con aviso, resaltado de tarjetas, Escape para salir, reinicio al cambiar de vista o perfil
- **Edición de producto**: prellenado del formulario, cambio de categoría y subcategoría, ajuste de stock registrado en el historial
- **Formulario de alta**: rejilla de dos columnas, tarjeta centrada, variantes de ropa
- **Migración** de las tres claves antiguas

---

## 10. Límites actuales

Se listingan sin adornos porque conviene saberlos:

1. **Contraseñas en texto plano.** `localStorage` no cifra nada; cualquiera con acceso al navegador puede leerlas. Aceptable mientras la app sea local y de un solo dispositivo; inaceptable en cuanto haya backend o uso compartido del equipo.
2. **Los datos viven en un solo dispositivo.** No hay sincronización: dos computers con la app no ven lo mismo. Exportar/importar es el parche, no la solución.
3. **El historial de ventas no tiene pantalla.** Se guarda (`historial`) pero no se muestra en ninguna parte de la interfaz.
4. **No hay costos ni utilidad.** Solo existe el precio de venta. Sin costo de compra no se puede calcular margen, y sin margen el dueño no sabe si está ganando o perdiendo dinero.
5. **No hay carrito ni catálogo para el cliente final.** Todo el flujo es del lado del negocio.
6. **CSS con mucho `!important`**, sobre todo en `#modali` y `#modali-content`. Funciona, pero afinar estilos ahí es frágil.
7. **Nombres heredados**: `#modali`, `#modali-content` y la clase `.closing` son restos de versiones anteriores; `.closing` convive con `.show` para el mismo efecto.

---

## 11. Camino a seguir

En orden de valor para el negocio:

1. **Historial de ventas visible** — un módulo con las ventas por día, total del período y exportación. Los datos ya existen; es cosa de pintarlos.
2. **Costos y utilidad** — guardar el costo de compra por producto (ya se conoce en las compras a proveedor) y mostrar margen en la tarjeta y en la cuenta.
3. **Catálogo y pedido del cliente** — la otra mitad de "vender y comprar": un catálogo consultable, carrito y pedido, con una cola de pedidos que el negocio ve y despacha.
4. **Backend y sincronización** — con backend real, las contraseñas se hashean, los datos se comparten entre dispositivos y el inventario deja de depender del navegador.
5. **Cuentas por pagar** — consolidar las compras a proveedor en facturas con vencimiento y estado de pago.
6. **Métricas del negocio** — productos que más rotan, productos que no se venden, ventas por día de la semana.

---

*Documento generado a partir del código en `andrescorena96-ux/MenuStock`, commit `dfa42f5`.*


