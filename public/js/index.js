/* ===== Etalase Produk: Fetch API + DOM ===== */

const API_URL = "https://dummyjson.com/products";
const TIMEOUT_MS = 10000;

// State aplikasi: semua produk + filter yang sedang aktif
const state = {
  products: [],
  keyword: "",
  category: "all",
};

// Referensi elemen DOM
const searchInput = document.getElementById("search");
const categorySelect = document.getElementById("category");
const statusEl = document.getElementById("status");
const grid = document.getElementById("product-grid");
const errorBox = document.getElementById("error-box");
const errorMessage = document.getElementById("error-message");
const retryBtn = document.getElementById("retry-btn");

const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

/* ---------- Tampilan status: loading, error, sukses ---------- */

function showLoading() {
  errorBox.hidden = true;
  grid.setAttribute("aria-busy", "true");
  statusEl.textContent = "Memuat data produk…";
  searchInput.disabled = true;
  categorySelect.disabled = true;

  // Kerangka kartu (skeleton) selama data dimuat
  grid.replaceChildren();
  for (let i = 0; i < 8; i++) {
    const sk = document.createElement("div");
    sk.className = "card skeleton";
    sk.setAttribute("aria-hidden", "true");
    grid.appendChild(sk);
  }
}

function showError(message) {
  grid.replaceChildren();
  grid.setAttribute("aria-busy", "false");
  statusEl.textContent = "";
  errorMessage.textContent = message;
  errorBox.hidden = false;
}

/* ---------- Fetch API ---------- */

async function fetchProducts() {
  showLoading();

  // Batalkan request jika terlalu lama
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(API_URL, { signal: controller.signal });

    if (!response.ok) {
      throw new Error(`Server membalas dengan status ${response.status}.`);
    }

    const data = await response.json(); // olah response JSON
    if (!data || !Array.isArray(data.products)) {
      throw new Error("Format data dari server tidak sesuai.");
    }

    state.products = data.products;
    fillCategories();
    searchInput.disabled = false;
    categorySelect.disabled = false;
    render();
  } catch (err) {
    const message =
      err.name === "AbortError"
        ? "Server terlalu lama merespons. Periksa koneksi internetmu lalu coba lagi."
        : `Data produk gagal dimuat. ${err.message} Periksa koneksi internetmu lalu coba lagi.`;
    showError(message);
  } finally {
    clearTimeout(timer);
  }
}

/* ---------- Render produk ke halaman (DOM) ---------- */

function fillCategories() {
  const categories = [...new Set(state.products.map((p) => p.category))].sort();
  categorySelect.replaceChildren(new Option("Semua kategori", "all"));
  categories.forEach((c) => categorySelect.appendChild(new Option(toTitle(c), c)));
}

function toTitle(text) {
  return text.replace(/-/g, " ").replace(/\b\w/g, (ch) => ch.toUpperCase());
}

function getFilteredProducts() {
  const keyword = state.keyword.trim().toLowerCase();
  return state.products.filter((p) => {
    const matchName = p.title.toLowerCase().includes(keyword);
    const matchCategory = state.category === "all" || p.category === state.category;
    return matchName && matchCategory;
  });
}

function createCard(product) {
  const card = document.createElement("article");
  card.className = "card";

  const img = document.createElement("img");
  img.src = product.thumbnail;
  img.alt = product.title;
  img.loading = "lazy";

  const body = document.createElement("div");
  body.className = "card-body";

  const category = document.createElement("span");
  category.className = "tag";
  category.textContent = toTitle(product.category);

  const name = document.createElement("h3");
  name.textContent = product.title;

  const price = document.createElement("p");
  price.className = "price";
  price.textContent = usd.format(product.price);

  const meta = document.createElement("p");
  meta.className = "meta";
  meta.textContent = `Rating ${product.rating} · Stok ${product.stock}`;

  const detail = document.createElement("p");
  detail.className = "detail";
  detail.textContent = product.description;
  detail.hidden = true;

  // Event click: tampilkan / sembunyikan deskripsi produk
  const toggle = document.createElement("button");
  toggle.type = "button";
  toggle.className = "link-btn";
  toggle.textContent = "Lihat detail";
  toggle.setAttribute("aria-expanded", "false");
  toggle.addEventListener("click", () => {
    detail.hidden = !detail.hidden;
    toggle.textContent = detail.hidden ? "Lihat detail" : "Tutup detail";
    toggle.setAttribute("aria-expanded", String(!detail.hidden));
  });

  body.append(category, name, price, meta, detail, toggle);
  card.append(img, body);
  return card;
}

function render() {
  const list = getFilteredProducts();
  grid.replaceChildren();
  grid.setAttribute("aria-busy", "false");

  if (list.length === 0) {
    statusEl.textContent = "Tidak ada produk yang cocok. Ubah kata kunci atau pilih kategori lain.";
    return;
  }

  const fragment = document.createDocumentFragment();
  list.forEach((p) => fragment.appendChild(createCard(p)));
  grid.appendChild(fragment);
  statusEl.textContent = `Menampilkan ${list.length} dari ${state.products.length} produk.`;
}

/* ---------- Event listener ---------- */

searchInput.addEventListener("input", (e) => {
  state.keyword = e.target.value;
  render();
});

categorySelect.addEventListener("change", (e) => {
  state.category = e.target.value;
  render();
});

retryBtn.addEventListener("click", fetchProducts);

// Mulai saat halaman dibuka
fetchProducts();
