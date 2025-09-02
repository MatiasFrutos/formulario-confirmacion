# 📄 Explicación del código — Formulario de Confirmación de Compra

Este módulo corresponde a **Agronomía Inteligente SRL**.  
Se trata de un formulario web para confirmar compras, seleccionar productos, aceptar términos y generar un **PDF automático**.

---

## 🏗️ Estructura de archivos

- **form-confirmacion.html**  
  - Define la estructura del formulario.  
  - Incluye:
    - **Encabezado (`header`)** con logo, nombre de la empresa y subtítulo.  
    - **Formulario (`form#formCompra`)** dividido en secciones:
      1. **Datos de facturación y contacto** → razón social, CUIT, email, teléfono, dirección, ciudad y ejecutivo de ventas.  
      2. **Productos y especificaciones** → checkboxes de cámaras (Solar Fija, Solar Domo, Solar Domo Pro, Fija Hogareña, Otro). Cada producto tiene un campo de cantidad o modelo asociado.  
      3. **Declaraciones** → casillas obligatorias de confidencialidad y aceptación de términos y condiciones.  
    - **Aside (resumen)** con total de unidades y botones de acción (Enviar, Limpiar).  
    - **Modal (`dialog`)** con el texto de Términos y Condiciones.  
    - **Footer** con © y año dinámico:contentReference[oaicite:0]{index=0}.

- **form-confirmacion.css**  
  - Define estilos visuales y responsive:
    - Paleta en blanco, negro y amarillo (`--accent`).  
    - **Tarjetas (`.card`)** para separar secciones con borde y sombra.  
    - **Campos (`.field`)** con labels, inputs y focus con borde amarillo.  
    - **Productos** en filas con checkbox a la izquierda y cantidad/modelo a la derecha.  
    - **Botones (`.btn`)**: primario (gradiente amarillo), ghost (borde gris), link de TyC (estilo pill).  
    - **Modal** con fondo transparente y caja blanca centrada.  
    - **Resumen (aside)** en sticky en escritorio y apilado en móvil.  
    - Diseño adaptable hasta pantallas muy pequeñas:contentReference[oaicite:1]{index=1}.

- **form-confirmacion.js**  
  - Lógica de interacción y validación:
    - Helpers (`$`) para seleccionar elementos.  
    - **Fallback de logo** en caso de error de carga.  
    - Autofecha en campo de compra (por defecto el día de hoy).  
    - Contador de caracteres en especificaciones (máx. 800).  
    - Mostrar/ocultar inputs de cantidad/modelos según productos seleccionados.  
    - **Resumen dinámico** con total de unidades.  
    - **Modal de Términos y Condiciones** con botones para abrir/cerrar y aceptar.  
    - **Generación de PDF (`generarPDF()`)** usando jsPDF + autoTable:  
      - Encabezado con logo/nombre.  
      - Datos de facturación.  
      - Productos seleccionados con cantidades.  
      - Especificaciones técnicas.  
      - Declaraciones (confidencialidad y TyC).  
      - Footer con fecha/hora de generación.  
    - Validaciones en `submit`:
      - Revisión de campos obligatorios.  
      - Al menos un producto seleccionado y cantidad válida.  
      - Aceptar confidencialidad y TyC.  
      - Límite de archivo comprobante: 10 MB.  
    - Si todo es correcto → genera y descarga el PDF:contentReference[oaicite:2]{index=2}.

---

## 🔑 Puntos importantes

- Todos los campos obligatorios muestran error si están vacíos.  
- No se puede enviar sin aceptar **Confidencialidad** y **Términos y Condiciones**.  
- El **PDF** se genera automáticamente al enviar, con nombre:  
  `confirmacion-compra-[fecha].pdf`.  
- El diseño es responsivo y se adapta a pantallas chicas.  
- Si no se encuentra el logo (`logo.png`), se usa un SVG alternativo.  

---

## 📂 Archivos

├── form-confirmacion.html # Estructura del formulario
├── form-confirmacion.css # Estilos visuales y responsive
└── form-confirmacion.js # Lógica, validaciones y PDF
