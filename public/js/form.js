/* ===== Form Hitung Diskon: DOM + Event Handling ===== */

// Aturan validasi tiap field. Mengembalikan pesan error, atau "" jika valid.
const rules = {
  productName(value) {
    const v = value.trim();
    if (v === "") return "Nama produk wajib diisi.";
    if (v.length < 3 || v.length > 50) return "Nama produk harus 3–50 karakter.";
    if (!/[a-zA-Z]/.test(v)) return "Nama produk harus mengandung huruf.";
    return "";
  },
  price(value) {
    if (value.trim() === "") return "Harga wajib diisi.";
    const n = Number(value);
    if (!Number.isInteger(n)) return "Harga harus berupa angka bulat.";
    if (n < 1000 || n > 100000000) return "Harga harus antara Rp 1.000 dan Rp 100.000.000.";
    return "";
  },
  discount(value) {
    if (value.trim() === "") return "Diskon wajib diisi.";
    const n = Number(value);
    if (Number.isNaN(n)) return "Diskon harus berupa angka.";
    if (n < 0 || n > 90) return "Diskon harus antara 0% dan 90%.";
    return "";
  },
  qty(value) {
    if (value.trim() === "") return "Jumlah wajib diisi.";
    const n = Number(value);
    if (!Number.isInteger(n)) return "Jumlah harus berupa angka bulat.";
    if (n < 1 || n > 999) return "Jumlah harus antara 1 dan 999.";
    return "";
  },
};

const STORAGE_KEY = "week6-riwayat-diskon";

// Referensi elemen DOM
const form = document.getElementById("discount-form");
const fields = Object.keys(rules).map((name) => form.elements[name]);
const previewEl = document.getElementById("preview");
const feedbackEl = document.getElementById("feedback");
const historyList = document.getElementById("history-list");
const historyEmpty = document.getElementById("history-empty");
const clearBtn = document.getElementById("clear-history");

const rupiah = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

let records = loadRecords();

/* ---------- Validasi ---------- */

function validateField(input) {
  const message = rules[input.name](input.value);
  const errorEl = document.getElementById(`${input.name}-error`);
  errorEl.textContent = message;
  input.classList.toggle("invalid", message !== "");
  input.setAttribute("aria-invalid", String(message !== ""));
  return message === "";
}

function validateAll() {
  // Jalankan semua validasi (tidak berhenti di field pertama yang salah)
  const results = fields.map(validateField);
  return results.every(Boolean);
}

/* ---------- Perhitungan ---------- */

function calculate(price, discount, qty) {
  const discountPerItem = Math.round((price * discount) / 100);
  const finalPerItem = price - discountPerItem;
  return {
    discountPerItem,
    finalPerItem,
    total: finalPerItem * qty,
    saved: discountPerItem * qty,
  };
}

function readValues() {
  return {
    name: form.elements.productName.value.trim(),
    price: Number(form.elements.price.value),
    discount: Number(form.elements.discount.value),
    qty: Number(form.elements.qty.value),
  };
}

/* ---------- Pratinjau langsung (event input) ---------- */

function updatePreview() {
  const allValid = fields.every((f) => rules[f.name](f.value) === "");
  if (!allValid) {
    previewEl.textContent = "Isi semua kolom dengan benar untuk melihat perkiraan harga.";
    previewEl.classList.remove("ready");
    return;
  }
  const { price, discount, qty } = readValues();
  const r = calculate(price, discount, qty);
  previewEl.textContent = `Perkiraan total ${rupiah.format(r.total)} — hemat ${rupiah.format(r.saved)}.`;
  previewEl.classList.add("ready");
}

fields.forEach((input) => {
  // Validasi sambil mengetik, error langsung muncul di bawah input
  input.addEventListener("input", () => {
    validateField(input);
    updatePreview();
    feedbackEl.textContent = "";
  });
});

/* ---------- Tombol diskon cepat (event click) ---------- */

document.querySelector(".chips").addEventListener("click", (e) => {
  const chip = e.target.closest(".chip");
  if (!chip) return;
  const discountInput = form.elements.discount;
  discountInput.value = chip.dataset.discount;
  // Picu event input agar validasi dan pratinjau ikut diperbarui
  discountInput.dispatchEvent(new Event("input", { bubbles: true }));
  discountInput.focus();
});

/* ---------- Submit form ---------- */

form.addEventListener("submit", (e) => {
  e.preventDefault(); // cegah halaman reload

  if (!validateAll()) {
    feedbackEl.textContent = "Periksa kembali kolom yang bertanda merah.";
    feedbackEl.className = "feedback error-text";
    const firstInvalid = fields.find((f) => f.classList.contains("invalid"));
    if (firstInvalid) firstInvalid.focus();
    return;
  }

  const { name, price, discount, qty } = readValues();
  const result = calculate(price, discount, qty);

  records.unshift({
    id: Date.now(),
    name,
    price,
    discount,
    qty,
    total: result.total,
    saved: result.saved,
  });
  saveRecords();
  renderHistory();

  feedbackEl.textContent = `Tersimpan: ${name}, total ${rupiah.format(result.total)}.`;
  feedbackEl.className = "feedback ok-text";
});

form.addEventListener("reset", () => {
  // Tunggu browser mengosongkan field, lalu bersihkan error dan pratinjau
  setTimeout(() => {
    fields.forEach((f) => {
      document.getElementById(`${f.name}-error`).textContent = "";
      f.classList.remove("invalid");
      f.removeAttribute("aria-invalid");
    });
    feedbackEl.textContent = "";
    updatePreview();
  }, 0);
});

/* ---------- Riwayat (render DOM) ---------- */

function renderHistory() {
  historyList.replaceChildren();
  historyEmpty.hidden = records.length > 0;
  clearBtn.hidden = records.length === 0;

  records.forEach((item) => {
    const li = document.createElement("li");

    const info = document.createElement("div");
    const title = document.createElement("strong");
    title.textContent = item.name;
    const detail = document.createElement("span");
    detail.textContent = `${item.qty} × ${rupiah.format(item.price)}, diskon ${item.discount}%`;
    const total = document.createElement("span");
    total.className = "total";
    total.textContent = `Total ${rupiah.format(item.total)} (hemat ${rupiah.format(item.saved)})`;
    info.append(title, detail, total);

    const del = document.createElement("button");
    del.type = "button";
    del.className = "link-btn danger";
    del.dataset.id = item.id;
    del.textContent = "Hapus";
    del.setAttribute("aria-label", `Hapus riwayat ${item.name}`);

    li.append(info, del);
    historyList.appendChild(li);
  });
}

// Event delegation: satu listener untuk semua tombol "Hapus"
historyList.addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-id]");
  if (!btn) return;
  records = records.filter((item) => String(item.id) !== btn.dataset.id);
  saveRecords();
  renderHistory();
});

clearBtn.addEventListener("click", () => {
  records = [];
  saveRecords();
  renderHistory();
});

/* ---------- Penyimpanan lokal (localStorage) ---------- */

function loadRecords() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

function saveRecords() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch {
    /* abaikan jika penyimpanan tidak tersedia */
  }
}

renderHistory();
updatePreview();
