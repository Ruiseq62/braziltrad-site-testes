// ============================
// DOCUMENTOS – BrazilTrad
// ============================

// Lista de documentos (nomes não traduzidos, como pedido)
const docs = [
  {
    id: 'proforma',
    title: 'Proforma Invoice (Modelo)',
    desc: 'Modelo básico comercial',
    cat: 'commercial',
    file: '/assets/docs/Proforma_Invoice_Modelo.docx',
    ext: 'docx'
  },
  {
    id: 'invoice',
    title: 'Commercial Invoice (Modelo)',
    desc: 'Fatura comercial para exportação',
    cat: 'commercial',
    file: '/assets/docs/Commercial_Invoice_Modelo.docx',
    ext: 'docx'
  },
  {
    id: 'packing',
    title: 'Packing List (Modelo)',
    desc: 'Lista de embalagem padrão',
    cat: 'logistics',
    file: '/assets/docs/Packing_List_Modelo.xlsx',
    ext: 'xlsx'
  },
  {
    id: 'contract',
    title: 'Contrato Internacional',
    desc: 'Contrato básico de compra e venda',
    cat: 'contracts',
    file: '/assets/docs/Contrato_Compra_Venda_Internacional.docx',
    ext: 'docx'
  },
  {
    id: 'checklist',
    title: 'Checklist de Exportação',
    desc: 'Guia rápido de verificação',
    cat: 'guides',
    file: '/assets/docs/Checklist_Pequenos_Produtores.pdf',
    ext: 'pdf'
  }
];


// ======================
// RENDERIZAÇÃO DA LISTA
// ======================
function renderDocs(filter = "", category = "") {
  const list = document.getElementById("docsList");
  if (!list) return;

  const q = filter.toLowerCase().trim();

  const filtered = docs.filter(doc => {
    const matchQ = !q || (doc.title + doc.desc).toLowerCase().includes(q);
    const matchCat = !category || doc.cat === category;
    return matchQ && matchCat;
  });

  list.innerHTML = "";

  if (filtered.length === 0) {
    list.innerHTML = `<div class="small">Nenhum resultado encontrado.</div>`;
    return;
  }

  filtered.forEach(doc => {
    const item = document.createElement("div");
    item.className = "doc-item";

    item.innerHTML = `
      <div class="doc-thumb">${doc.ext.toUpperCase()}</div>
      <div class="doc-meta">
        <h3>${doc.title}</h3>
        <p>${doc.desc}</p>
      </div>

      <div class="doc-actions">
        <a class="small" href="${doc.file}" download>Download</a>
        <button class="btn" onclick="openModal('${doc.id}')">Baixar</button>
      </div>
    `;

    list.appendChild(item);
  });
}


// ======================
// FILTROS E PESQUISA
// ======================
document.addEventListener("DOMContentLoaded", () => {
  const search = document.getElementById("search");
  const category = document.getElementById("category");
  const clearBtn = document.getElementById("clearFilters");

  if (search) search.addEventListener("input", () => renderDocs(search.value, category.value));
  if (category) category.addEventListener("change", () => renderDocs(search.value, category.value));
  if (clearBtn) clearBtn.addEventListener("click", () => {
    search.value = "";
    category.value = "";
    renderDocs();
  });

  renderDocs();
});


// ======================
// MODAL DOWNLOAD + EMAIL
// ======================
let modalDocId = null;

function openModal(id) {
  modalDocId = id;
  const modal = document.getElementById("modal");
  if (!modal) return;

  modal.style.display = "flex";

  const doc = docs.find(d => d.id === id);
  document.getElementById("modalTitle").innerText = doc.title;
  document.getElementById("modalInfo").innerText = "";
}

if (typeof document !== "undefined") {
  document.addEventListener("click", (e) => {
    if (e.target.id === "modalClose") {
      document.getElementById("modal").style.display = "none";
    }
  });
}


// BOTÃO DE DOWNLOAD DO MODAL
document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("modalDownloadBtn");
  if (!btn) return;

  btn.addEventListener("click", async () => {
    const email = document.getElementById("modalEmail").value.trim();
    const info = document.getElementById("modalInfo");

    if (!email || !email.includes("@")) {
      info.style.color = "crimson";
      info.innerText = "Email inválido.";
      return;
    }

    const doc = docs.find(d => d.id === modalDocId);

    // Enviar para backend / Zoho
    try {
      await fetch("/api/lead-download", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
          email,
          docId: doc.id,
          docTitle: doc.title,
          source: "documentos-page"
        })
      });
    } catch (err) {
      console.warn("Falha no envio do lead:", err);
    }

    // Download
    const a = document.createElement("a");
    a.href = doc.file;
    a.download = doc.file.split("/").pop();
    document.body.appendChild(a);
    a.click();
    a.remove();

    info.style.color = "green";
    info.innerText = "Download iniciado.";
    setTimeout(() => {
      document.getElementById("modal").style.display = "none";
    }, 1200);
  });
});


// ======================
// KIT (ZIP)
// ======================
document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("downloadPack");
  if (!btn) return;

  btn.addEventListener("click", async () => {
    const email = document.getElementById("leadEmail").value.trim();
    if (!email || !email.includes("@")) {
      alert("Email inválido.");
      return;
    }

    // registrar no CRM
    try {
      await fetch("/api/lead-download", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
          email,
          docId: "kit-inicial",
          docTitle: "BrazilTrad Export Kit",
          source: "documentos-kit"
        })
      });
    } catch(err){}

    // download
    const zip = "/assets/docs/BrazilTrad_Kit.zip";
    const a = document.createElement("a");
    a.href = zip;
    a.download = "BrazilTrad_Kit.zip";
    document.body.appendChild(a);
    a.click();
    a.remove();

    alert("Enviado! Verifique seu email.");
  });
});
