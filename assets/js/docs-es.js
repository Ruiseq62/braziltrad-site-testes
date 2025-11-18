// docs-es.js
// Español (ES)

const docs = [
  { id: 'proforma', title: 'Factura Proforma (Plantilla)', desc: 'Factura proforma comercial estándar', cat: 'commercial', file: '/assets/docs/Factura_Proforma_Plantilla.docx', ext: 'docx' },
  { id: 'invoice', title: 'Factura Comercial (Plantilla)', desc: 'Factura comercial para exportación', cat: 'commercial', file: '/assets/docs/Factura_Comercial_Plantilla.docx', ext: 'docx' },
  { id: 'packing', title: 'Packing List (Plantilla)', desc: 'Lista de embalaje estándar', cat: 'logistics', file: '/assets/docs/Lista_de_Embalaje_Plantilla.xlsx', ext: 'xlsx' },
  { id: 'contract', title: 'Contrato Internacional', desc: 'Contrato básico de compraventa internacional', cat: 'contracts', file: '/assets/docs/Contrato_Internacional.docx', ext: 'docx' },
  { id: 'checklist', title: 'Checklist de Exportación', desc: 'Guía rápida de verificación para exportar', cat: 'guides', file: '/assets/docs/Checklist_Exportacion.pdf', ext: 'pdf' }
];

const LOCALE = {
  noResults: "No se han encontrado resultados.",
  downloadLabel: "Descargar",
  btnDownload: "Descargar",
  invalidEmail: "Correo electrónico no válido.",
  downloadStarted: "Descarga iniciada.",
  kitAlert: "¡Enviado! Revisa tu correo.",
  searchPlaceholder: "Buscar…",
  allCategoriesLabel: "Todas",
  clearLabel: "Limpiar"
};

function getEl(...ids) { for (const id of ids) { const el = document.getElementById(id); if (el) return el; } return null; }

function renderDocs(filter = "", category = "") {
  const list = getEl("docsList", "docsArea");
  if (!list) return;
  const q = (filter || "").toLowerCase().trim();
  const filtered = docs.filter(doc => {
    const matchQ = !q || (doc.title + doc.desc).toLowerCase().includes(q);
    const matchCat = !category || doc.cat === category;
    return matchQ && matchCat;
  });
  list.innerHTML = "";
  if (filtered.length === 0) { list.innerHTML = `<div class="small">${LOCALE.noResults}</div>`; return; }
  filtered.forEach(doc => {
    const item = document.createElement("div");
    item.className = "doc-card";
    item.innerHTML = `
      <div class="doc-card-title">${doc.title}</div>
      <div class="small">${doc.desc}</div>
      <div style="margin-top:10px">
        <a class="small" href="${doc.file}" download>${LOCALE.downloadLabel}</a>
        <button class="btn" onclick="openModal('${doc.id}')">${LOCALE.btnDownload}</button>
      </div>
      <div style="margin-top:10px;color:#444;font-weight:600">${doc.ext.toUpperCase()}</div>
    `;
    list.appendChild(item);
  });
}

let modalDocId = null;
function openModal(id) {
  modalDocId = id;
  const modal = getEl("modal");
  if (!modal) {
    const doc = docs.find(d => d.id === id);
    if (doc) { const a = document.createElement("a"); a.href = doc.file; a.download = doc.file.split("/").pop(); document.body.appendChild(a); a.click(); a.remove(); }
    return;
  }
  modal.style.display = "flex";
  const doc = docs.find(d => d.id === id);
  getEl("modalTitle") && (getEl("modalTitle").innerText = doc.title);
  getEl("modalInfo") && (getEl("modalInfo").innerText = "");
}

document.addEventListener("click", (e) => { if (e.target && e.target.id === "modalClose") getEl("modal") && (getEl("modal").style.display = "none"); });

document.addEventListener("DOMContentLoaded", () => {
  const search = getEl("search", "searchInput");
  const category = getEl("category", "categoryFilter");
  const clearBtn = getEl("clearFilters", "docClear");

  if (search) { search.placeholder = LOCALE.searchPlaceholder; search.addEventListener("input", () => renderDocs(search.value, category ? category.value : "")); }
  if (category) { renderDocs(search ? search.value : "", category.value); category.addEventListener("change", () => renderDocs(search ? search.value : "", category.value)); }
  if (clearBtn) { clearBtn.innerText = LOCALE.clearLabel; clearBtn.addEventListener("click", () => { if (search) search.value = ""; if (category) category.value = ""; renderDocs(); }); }

  const modalBtn = getEl("modalDownloadBtn");
  if (modalBtn) {
    modalBtn.addEventListener("click", async () => {
      const emailEl = getEl("modalEmail");
      const info = getEl("modalInfo");
      const email = emailEl ? emailEl.value.trim() : "";
      if (!email || !email.includes("@")) { if (info) { info.style.color = "crimson"; info.innerText = LOCALE.invalidEmail; } return; }
      const doc = docs.find(d => d.id === modalDocId);
      try { await fetch("/api/lead-download", { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify({ email, docId: doc.id, docTitle: doc.title, source: "documentos-page" }) }); } catch(e){}
      const a = document.createElement("a"); a.href = doc.file; a.download = doc.file.split("/").pop(); document.body.appendChild(a); a.click(); a.remove();
      if (info) { info.style.color = "green"; info.innerText = LOCALE.downloadStarted; }
      setTimeout(()=> getEl("modal") && (getEl("modal").style.display = "none"), 1200);
    });
  }

  const kitBtn = getEl("downloadPack");
  if (kitBtn) {
    kitBtn.addEventListener("click", async () => {
      const leadEmail = getEl("leadEmail");
      const email = leadEmail ? leadEmail.value.trim() : "";
      if (!email || !email.includes("@")) { alert(LOCALE.invalidEmail); return; }
      try { await fetch("/api/lead-download", { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify({ email, docId: "kit-inicial", docTitle: "BrazilTrad Export Kit", source: "documentos-kit" }) }); } catch(e){}
      const zip = "/assets/docs/BrazilTrad_Kit_ES.zip";
      const a = document.createElement("a"); a.href = zip; a.download = "BrazilTrad_Kit_ES.zip"; document.body.appendChild(a); a.click(); a.remove();
      alert(LOCALE.kitAlert);
    });
  }

  renderDocs();
});
