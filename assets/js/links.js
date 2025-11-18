// ============================
// LINKS ÚTEIS – BrazilTrad
// ============================

const links = [
  {
    title: "Receita Federal – Siscomex",
    url: "https://www.gov.br/receitafederal",
    desc: "Informações aduaneiras e comércio exterior.",
    cat: "gov"
  },
  {
    title: "MAPA – Ministério da Agricultura",
    url: "https://www.gov.br/agricultura",
    desc: "Sanidade, certificação e exportação agro.",
    cat: "gov"
  },
  {
    title: "Banco Central – Câmbio",
    url: "https://www.bcb.gov.br",
    desc: "Taxas e regulamentação cambial.",
    cat: "finance"
  },
  {
    title: "CME – Commodities Futures",
    url: "https://www.cmegroup.com",
    desc: "Cotações globais de commodities.",
    cat: "market"
  },
  {
    title: "FAO – ONU Agricultura",
    url: "https://www.fao.org",
    desc: "Dados e relatórios de mercados agrícolas.",
    cat: "orgs"
  }
];


// =======================
// RENDERIZA A LISTA
// =======================
function renderLinks(q = "", category = "") {
  const area = document.getElementById("linksArea");
  if (!area) return;

  const term = q.toLowerCase().trim();

  const filtered = links.filter(l => {
    const matchQ = !term || (l.title + l.desc).toLowerCase().includes(term);
    const matchCat = !category || l.cat === category;
    return matchQ && matchCat;
  });

  area.innerHTML = "";

  if (filtered.length === 0) {
    area.innerHTML = `<div class="small">Nenhum resultado encontrado.</div>`;
    return;
  }

  filtered.forEach(l => {
    const el = document.createElement("div");
    el.className = "link-item";

    el.innerHTML = `
      <div>
        <div style="font-weight:600">${l.title}</div>
        <div class="small">${l.desc}</div>
      </div>
      <div style="display:flex;flex-direction:column;gap:8px;align-items:flex-end">
        <a class="small" href="${l.url}" target="_blank" rel="noopener noreferrer">Abrir</a>
        <button class="btn" onclick="copyLink('${l.url}')">Copiar</button>
      </div>
    `;

    area.appendChild(el);
  });
}


// =======================
// COPIAR LINK
// =======================
function copyLink(url) {
  navigator.clipboard.writeText(url).then(() => {
    alert("Copiado!");
  });
}


// =======================
// EVENTOS
// =======================
document.addEventListener("DOMContentLoaded", () => {
  const search = document.getElementById("linkSearch");
  const category = document.getElementById("linkCategory");
  const clear = document.getElementById("linkClear");

  if (search) search.addEventListener("input", () => renderLinks(search.value, category.value));
  if (category) category.addEventListener("change", () => renderLinks(search.value, category.value));
  if (clear) clear.addEventListener("click", () => {
    search.value = "";
    category.value = "";
    renderLinks();
  });

  renderLinks();
});
