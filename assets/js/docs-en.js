// docs-en.js
// English version — documents + UI strings

const docs = [
  {
    id: 'proforma',
    title: 'Proforma Invoice (Template)',
    desc: 'Standard commercial proforma invoice',
    cat: 'commercial',
    file: '/assets/docs/Proforma_Invoice_Template.docx',
    ext: 'docx'
  },
  {
    id: 'invoice',
    title: 'Commercial Invoice (Template)',
    desc: 'Commercial invoice for export',
    cat: 'commercial',
    file: '/assets/docs/Commercial_Invoice_Template.docx',
    ext: 'docx'
  },
  {
    id: 'packing',
    title: 'Packing List (Template)',
    desc: 'Standard packing list template',
    cat: 'logistics',
    file: '/assets/docs/Packing_List_Template.xlsx',
    ext: 'xlsx'
  },
  {
    id: 'contract',
    title: 'International Contract',
    desc: 'Basic international sale & purchase contract',
    cat: 'contracts',
    file: '/assets/docs/International_Contract.docx',
    ext: 'docx'
  },
  {
    id: 'checklist',
    title: 'Export Checklist',
    desc: 'Quick export readiness checklist',
    cat: 'guides',
    file: '/assets/docs/Export_Checklist.pdf',
    ext: 'pdf'
  }
];

const LOCALE = {
  noResults: "No results found.",
  downloadLabel: "Download",
  btnDownload: "Download",
  invalidEmail: "Invalid email address.",
  downloadStarted: "Download started.",
  kitAlert: "Sent! Check your email.",
  searchPlaceholder: "Search…",
  allCategoriesLabel: "All categories",
  clearLabel: "Clear"
};

function getEl(...ids) {
  for (const id of ids) {
    const el = document.getElementById(id);
    if (el) return el;
  }
  return null;
}

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

  if (filtered.length === 0) {
    list.innerHTML = `<div class="small">${LOCALE.noResults}</div>`;
    return;
  }

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
  const doc = docs.find(d => d.id === id);

  if (!modal) {
    const a = document.createElement("a");
    a.href = doc.file;
    a.download = doc.file.split("/").pop();
    document.body.appendChild(a);
    a.click();
    a.remove();
    return;
  }

  modal.style.display = "flex";
  getEl("modalTitle").innerText = doc.title;
  getEl("modalInfo").innerText = "";
}

document.addEventListener("click", (e) => {
  if (e.target.id === "modalClose") {
    const modal = getEl("modal");
    if (modal) modal.style.display = "none";
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const search = getEl("search", "searchInput");
  const category = getEl("category", "categoryFilter");
  const clearBtn = getEl("clearFilters", "docClear");

  if (search) {
    search.placeholder = LOCALE.searchPlaceholder;
    search.addEventListener("input", () =>
      renderDocs(search.value, category ? category.value : "")
    );
  }

  if (category) {
    category.addEventListener("change", () =>
      renderDocs(search ? search.value : "", category.value)
    );
  }

  if (clearBtn) {
    clearBtn.innerText = LOCALE.clearLabel;
    clearBtn.addEventListener("click", () => {
      if (search) search.value = "";
      if (category) category.value = "";
      renderDocs();
    });
  }

  const modalBtn = getEl("modalDownloadBtn");
  if (modalBtn) {
    modalBtn.addEventListener("click", async () => {
      const emailEl = getEl("modalEmail");
      const info = getEl("modalInfo");
      const email = emailEl.value.trim();

      if (!email || !email.includes("@")) {
        info.style.color = "crimson";
        info.innerText = LOCALE.invalidEmail;
        return;
      }

      const doc = docs.find(d => d.id === modalDocId);

      try {
        await fetch("/api/lead-download", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            docId: doc.id,
            docTitle: doc.title,
            source: "documents-page"
          })
        });
      } catch (_) {}

      const a = document.createElement("a");
      a.href = doc.file;
      a.download = doc.file.split("/").pop();
      document.body.appendChild(a);
      a.click();
      a.remove();

      info.style.color = "green";
      info.innerText = LOCALE.downloadStarted;

      setTimeout(() => {
        const modal = getEl("modal");
        if (modal) modal.style.display = "none";
      }, 1200);
    });
  }

  const kitBtn = getEl("downloadPack");
  if (kitBtn) {
    kitBtn.addEventListener("click", async () => {
      const email = getEl("leadEmail").value.trim();

      if (!email || !email.includes("@")) {
        alert(LOCALE.invalidEmail);
        return;
      }

      try {
        await fetch("/api/lead-download", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            docId: "export-kit",
            docTitle: "BrazilTrad Export Kit",
            source: "documents-kit"
          })
        });
      } catch (_) {}

      const zip = "/assets/docs/BrazilTrad_Export_Kit.zip";
      const a = document.createElement("a");
      a.href = zip;
      a.download = "BrazilTrad_Export_Kit.zip";
      document.body.appendChild(a);
      a.click();
      a.remove();

      alert(LOCALE.kitAlert);
    });
  }

  renderDocs();
});
