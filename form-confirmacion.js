// ===== Helpers
const $ = (sel, ctx=document) => ctx.querySelector(sel);

// Colores (coinciden con el CSS)
const PALETTE = {
  ink:    [17,24,39],     // #111827
  accent: [245,158,11],   // #f59e0b
  line:   [229,231,235],  // #e5e7eb
};

// Año en footer
$('#year').textContent = new Date().getFullYear();

// ===== Fallback de logo si no existe logo.png
const logoImg = document.getElementById('logoImg');
const FALLBACK_LOGO = 'data:image/svg+xml;utf8,' + encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" width="360" height="80">
    <rect width="100%" height="100%" fill="#ffffff"/>
    <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle"
          font-family="Helvetica, Arial, sans-serif" font-size="20" fill="#111827">
      Agronomía Inteligente SRL
    </text>
    <rect x="0" y="76" width="360" height="4" fill="#f59e0b"/>
  </svg>
`);
logoImg?.addEventListener('error', () => { logoImg.src = FALLBACK_LOGO; });

// Autofecha: hoy
(function setToday(){
  const input = $('#fechaCompra');
  if (!input) return;
  const tzoffset = (new Date()).getTimezoneOffset() * 60000;
  const today = new Date(Date.now() - tzoffset).toISOString().slice(0,10);
  input.value = today;
})();

// Contador especificaciones (máx 800)
(function specCounter(){
  const ta = $('#especificaciones');
  const out = $('#countSpecs');
  if (!ta || !out) return;
  const max = 800;
  const update = () => {
    const n = Math.min(ta.value.length, max);
    out.textContent = `${n}/${max}`;
    if (ta.value.length > max) ta.value = ta.value.slice(0, max);
  };
  ta.addEventListener('input', update);
  update();
})();

// ===== Productos: mostrar/ocultar cantidades
const prodFija       = $('#prodFija');
const prodDomo       = $('#prodDomo');
const prodDomoPro    = $('#prodDomoPro');
const prodFijaHogar  = $('#prodFijaHogar');
const prodOtro       = $('#prodOtro');

const qtyFija        = $('#qtyFija');
const qtyDomo        = $('#qtyDomo');
const qtyDomoPro     = $('#qtyDomoPro');
const qtyFijaHogar   = $('#qtyFijaHogar');
const otroModelos    = $('#otroModelos');

const cantFija       = $('#cantFija');
const cantDomo       = $('#cantDomo');
const cantDomoPro    = $('#cantDomoPro');
const cantFijaHogar  = $('#cantFijaHogar');
const modelos        = $('#modelos');

function toggle(el, box){
  if (!el || !box) return;
  box.hidden = !el.checked;
  if (box.hidden){
    const input = box.querySelector('input');
    if (input) input.value = '';
  }
}
function applyToggles(){
  toggle(prodFija, qtyFija);
  toggle(prodDomo, qtyDomo);
  toggle(prodDomoPro, qtyDomoPro);
  toggle(prodFijaHogar, qtyFijaHogar);
  toggle(prodOtro, otroModelos);
  updateResumen();
}
[prodFija, prodDomo, prodDomoPro, prodFijaHogar, prodOtro].forEach(el => el?.addEventListener('change', applyToggles));
[cantFija, cantDomo, cantDomoPro, cantFijaHogar, modelos].forEach(el => el?.addEventListener('input', updateResumen));
applyToggles();

// Resumen
function updateResumen(){
  const nFija       = prodFija?.checked ? parseInt(cantFija.value || '0', 10) : 0;
  const nDomo       = prodDomo?.checked ? parseInt(cantDomo.value || '0', 10) : 0;
  const nDomoPro    = prodDomoPro?.checked ? parseInt(cantDomoPro.value || '0', 10) : 0;
  const nFijaHogar  = prodFijaHogar?.checked ? parseInt(cantFijaHogar.value || '0', 10) : 0;
  const total = [nFija, nDomo, nDomoPro, nFijaHogar].map(n => Number.isFinite(n) ? n : 0).reduce((a,b) => a+b, 0);
  $('#sumUnidades').textContent = String(total);
}

// Modal TyC
const dlgTyC = $('#dlgTyC');
$('#btnVerTyC')?.addEventListener('click', () => dlgTyC?.showModal());
$('#btnCloseTyC')?.addEventListener('click', () => dlgTyC?.close());
$('#btnAceptoTyC')?.addEventListener('click', () => {
  $('#chkTyC').checked = true;
  dlgTyC?.close();
});

// ===== Util: esperar a que cargue el logo (o fallar elegante)
function waitImageLoaded(img, timeoutMs=4000){
  return new Promise(resolve=>{
    if(!img) return resolve(null);
    if(img.complete && img.naturalWidth) return resolve(img);
    const timer=setTimeout(()=>resolve(null), timeoutMs);
    img.addEventListener('load',()=>{ clearTimeout(timer); resolve(img); }, {once:true});
    img.addEventListener('error',()=>{ clearTimeout(timer); resolve(null); }, {once:true});
  });
}

// ===== Generación del PDF
async function generarPDF(){
  const { jsPDF } = window.jspdf || {};
  if(!jsPDF) throw new Error('jsPDF no está cargado');

  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const M = 48; // margen
  let y = M;

  // Encabezado con logo y marca
  try{
    const img = await waitImageLoaded($('#logoImg'));
    if (img){
      const logoW = 90, logoH = 54; // aprox
      doc.addImage(img, 'PNG', M, y, logoW, logoH);
      doc.setTextColor(...PALETTE.ink);
      doc.setFont('helvetica','bold');  doc.setFontSize(16);
      doc.text('Agronomía Inteligente SRL', M + logoW + 12, y + 18);
      doc.setFont('helvetica','normal'); doc.setFontSize(12);
      doc.text('Confirmación de compra', M + logoW + 12, y + 38);
      y += logoH + 16;
    } else {
      // sin logo: solo textos
      doc.setTextColor(...PALETTE.ink);
      doc.setFont('helvetica','bold'); doc.setFontSize(16); doc.text('Agronomía Inteligente SRL', M, y);
      doc.setFont('helvetica','normal'); doc.setFontSize(12); doc.text('Confirmación de compra', M, y+18);
      y += 34;
    }
  }catch{ /* si falla el logo, seguimos */ }

  // Línea acento
  doc.setDrawColor(...PALETTE.accent); doc.setLineWidth(3);
  doc.line(M, y, pageW - M, y); y += 18;

  const sectionTitle = (text) => {
    doc.setTextColor(...PALETTE.ink);
    doc.setFont('helvetica','bold'); doc.setFontSize(13);
    doc.text(text, M, y);
    doc.setDrawColor(...PALETTE.accent); doc.setLineWidth(2);
    doc.line(M, y+4, pageW - M, y+4);
    y += 16;
  };

  // ===== Datos de facturación
  sectionTitle('Datos de facturación y contacto');

  const razon = $('#razon').value || '';
  const cuit = $('#cuit').value || '';
  const email = $('#email').value || '';
  const tel = $('#tel').value || '';
  const direccion = $('#direccion').value || '';
  const ciudad = $('#ciudad').value || '';
  const ejecutivo = $('#ejecutivo').value || '';
  const fechaCompra = $('#fechaCompra').value || '';
  const origen = $('#origen').value || '—';

  const tablaDatos = [
    ['Razón social / Nombre', razon],
    ['CUIT / DNI', cuit],
    ['Email', email],
    ['Teléfono', tel],
    ['Dirección', direccion],
    ['Ciudad / Provincia', ciudad],
    ['Ejecutivo de ventas', ejecutivo],
    ['Fecha de compra', fechaCompra],
    ['¿Cómo nos conoció?', origen],
  ];

  if (doc.autoTable){
    doc.autoTable({
      startY: y,
      head: [['Campo','Valor']],
      body: tablaDatos,
      theme: 'grid',
      styles: { fontSize: 10, textColor: PALETTE.ink, cellPadding: 6, lineColor: PALETTE.line },
      headStyles: { fillColor: PALETTE.accent, textColor: PALETTE.ink, halign:'left' },
      columnStyles: { 0: { cellWidth: 170 } },
      margin: { left: M, right: M }
    });
    y = doc.lastAutoTable.finalY + 16;
  } else {
    doc.setFont('helvetica','normal'); doc.setFontSize(11);
    tablaDatos.forEach(([k,v],i)=> doc.text(`${k}: ${v}`, M, y + i*14));
    y += tablaDatos.length*14 + 16;
  }

  // ===== Productos
  sectionTitle('Productos seleccionados');
  const productos = [];
  if ($('#prodFija').checked)       productos.push(['Hik Solar Fija',       $('#cantFija').value || '—']);
  if ($('#prodDomo').checked)       productos.push(['Hik Solar Domo',       $('#cantDomo').value || '—']);
  if ($('#prodDomoPro').checked)    productos.push(['Hik Solar Domo Pro',   $('#cantDomoPro').value || '—']);
  if ($('#prodFijaHogar').checked)  productos.push(['Hik Fija Hogareña',    $('#cantFijaHogar').value || '—']);
  if ($('#prodOtro').checked)       productos.push(['Otro (modelos)',       $('#modelos').value || '—']);

  if (doc.autoTable){
    doc.autoTable({
      startY: y,
      head: [['Producto','Cantidad/Detalle']],
      body: productos.length ? productos : [['—','—']],
      theme: 'grid',
      styles: { fontSize: 10, textColor: PALETTE.ink, cellPadding: 6, lineColor: PALETTE.line },
      headStyles: { fillColor: PALETTE.accent, textColor: PALETTE.ink, halign:'left' },
      columnStyles: { 0: { cellWidth: 220 } },
      margin: { left: M, right: M }
    });
    y = doc.lastAutoTable.finalY + 16;
  } else {
    doc.setFont('helvetica','normal'); doc.setFontSize(11);
    (productos.length?productos:[['—','—']]).forEach(([k,v],i)=> doc.text(`${k}: ${v}`, M, y + i*14));
    y += (productos.length?productos.length:1)*14 + 16;
  }

  // ===== Especificaciones técnicas
  sectionTitle('Especificaciones técnicas');
  doc.setFont('helvetica','normal'); doc.setFontSize(11); doc.setTextColor(...PALETTE.ink);
  const especificaciones = ($('#especificaciones').value||'—').trim();
  const wrapped = doc.splitTextToSize(especificaciones, pageW - 2*M);
  doc.text(wrapped, M, y);
  y += wrapped.length * 14 + 8;

  // ===== Declaraciones
  sectionTitle('Declaraciones');
  const confOK = $('#chkConf').checked ? 'Sí' : 'No';
  const tycOK  = $('#chkTyC').checked ? 'Sí' : 'No';
  if (doc.autoTable){
    doc.autoTable({
      startY: y,
      body: [
        ['Confidencialidad aceptada', confOK],
        ['Términos y Condiciones aceptados', tycOK],
      ],
      theme: 'plain',
      styles: { fontSize: 11, textColor: PALETTE.ink, cellPadding: 4 },
      columnStyles: { 0: { cellWidth: 280 } },
      margin: { left: M, right: M }
    });
    y = doc.lastAutoTable.finalY + 12;
  } else {
    doc.text(`Confidencialidad aceptada: ${confOK}`, M, y);
    doc.text(`Términos y Condiciones aceptados: ${tycOK}`, M, y+14);
    y += 26;
  }

  // Footer con fecha de generación
  doc.setDrawColor(...PALETTE.line);
  doc.line(M, pageH - M, pageW - M, pageH - M);
  doc.setFont('helvetica','normal'); doc.setFontSize(10);
  const fechaGen = new Date().toLocaleString();
  doc.text(`Generado por Agronomía Inteligente SRL — ${fechaGen}`, M, pageH - M + 14);

  // Descarga
  const fname = `confirmacion-compra-${$('#fechaCompra').value || new Date().toISOString().slice(0,10)}.pdf`;
  doc.save(fname);
}

// ===== Validación + envío + PDF
const form = $('#formCompra');
const formMsg = $('#formMsg');
const errorMsg = (msg) => { formMsg.className = 'err'; formMsg.textContent = msg; };
const okMsg    = (msg) => { formMsg.className = 'ok'; formMsg.textContent = msg; };

form?.addEventListener('submit', async (e) => {
  e.preventDefault();

  // Validaciones HTML5
  if (!form.checkValidity()){
    form.reportValidity();
    return errorMsg('Revisá los campos marcados.');
  }

  // Lógica de productos
  const algunProducto = prodFija.checked || prodDomo.checked || prodDomoPro.checked || prodFijaHogar.checked || prodOtro.checked;
  if (!algunProducto) return errorMsg('Seleccioná al menos un producto.');
  if (prodFija.checked      && (!cantFija.value || +cantFija.value < 1))       return errorMsg('Indicá la cantidad de unidades (Hik Solar Fija).');
  if (prodDomo.checked      && (!cantDomo.value || +cantDomo.value < 1))       return errorMsg('Indicá la cantidad de unidades (Hik Solar Domo).');
  if (prodDomoPro.checked   && (!cantDomoPro.value || +cantDomoPro.value < 1)) return errorMsg('Indicá la cantidad de unidades (Hik Solar Domo Pro).');
  if (prodFijaHogar.checked && (!cantFijaHogar.value || +cantFijaHogar.value < 1)) return errorMsg('Indicá la cantidad de unidades (Hik Fija Hogareña).');
  if (prodOtro.checked && !modelos.value.trim()) return errorMsg('Especificá el/los modelos en “Otro”.');

  // Confidencialidad + TyC
  if (!$('#chkConf').checked) return errorMsg('Debés aceptar la cláusula de confidencialidad.');
  if (!$('#chkTyC').checked)  return errorMsg('Debés aceptar los Términos y Condiciones.');

  try{
    await generarPDF();
    okMsg('¡Confirmación enviada y PDF generado!');
    form.reset();
    applyToggles();
  }catch(err){
    console.error('PDF error:', err);
    errorMsg('Ocurrió un problema al generar el PDF. Si abriste el archivo con doble clic, probá servirlo desde un servidor local (p. ej., python -m http.server).');
  }
});

// Reset
$('#btnReset')?.addEventListener('click', () => {
  formMsg.className = '';
  formMsg.textContent = '';
  applyToggles();
});

// Límite archivo 10MB
$('#comprobante')?.addEventListener('change', (e) => {
  const f = e.target.files?.[0];
  if (!f) return;
  const max = 10 * 1024 * 1024;
  if (f.size > max){
    e.target.value = '';
    errorMsg('El archivo supera los 10MB.');
  } else {
    formMsg.textContent = '';
  }
});
