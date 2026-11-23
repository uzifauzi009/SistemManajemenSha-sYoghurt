const data = {
    partners: [
        { id: "MTR-001", name: "Toko Berkah Jaya", contact: "0812-0000-0001", address: "Jl. Merdeka No. 12, Banjar", joined: "12 Okt 2025", status: "Aktif" },
        { id: "MTR-002", name: "Kedai Sehat Segar", contact: "0813-1000-2002", address: "Jl. Ahmad Yani No. 8, Banjar", joined: "18 Okt 2025", status: "Aktif" },
        { id: "MTR-003", name: "Warung Bu Sari", contact: "0821-3000-4003", address: "Jl. Pahlawan No. 31, Banjar", joined: "02 Nov 2025", status: "Aktif" },
        { id: "MTR-004", name: "Toko Fresh Mart", contact: "0852-5000-6004", address: "Jl. Diponegoro No. 4, Banjar", joined: "10 Nov 2025", status: "Aktif" }
    ],
    invoices: [
        { id: "INV-0142", partnerId: "MTR-001", partner: "Toko Berkah Jaya", date: "28 Nov 2025", due: "05 Des 2025", amount: 6450000, status: "Belum lunas" },
        { id: "INV-0141", partnerId: "MTR-002", partner: "Kedai Sehat Segar", date: "27 Nov 2025", due: "04 Des 2025", amount: 3250000, status: "Lunas" },
        { id: "INV-0140", partnerId: "MTR-003", partner: "Warung Bu Sari", date: "26 Nov 2025", due: "03 Des 2025", amount: 1875000, status: "Belum lunas" },
        { id: "INV-0139", partnerId: "MTR-004", partner: "Toko Fresh Mart", date: "25 Nov 2025", due: "02 Des 2025", amount: 4200000, status: "Lunas" }
    ],
    distributions: [
        { id: "DST-0087", partner: "Toko Berkah Jaya", date: "Hari ini, 09.30", items: "12 dus", status: "Diproses" },
        { id: "DST-0086", partner: "Kedai Sehat Segar", date: "Hari ini, 08.15", items: "8 dus", status: "Dalam perjalanan" },
        { id: "DST-0085", partner: "Warung Bu Sari", date: "Kemarin, 14.20", items: "5 dus", status: "Terkirim" }
    ],
    products: [
        { id: "PRD-001", name: "Yoghurt Original", size: "250 ml", price: 12000, stock: 72 },
        { id: "PRD-002", name: "Yoghurt Stroberi", size: "250 ml", price: 14000, stock: 48 },
        { id: "PRD-003", name: "Yoghurt Blueberry", size: "250 ml", price: 14000, stock: 9 },
        { id: "PRD-004", name: "Yoghurt Original", size: "1 liter", price: 38000, stock: 26 }
    ]
};

const pageNames = {
    home: "Dashboard", mitra: "Mitra", penjualan: "Penjualan", tagihan: "Tagihan",
    distribusi: "Distribusi", produk: "Produk", profil: "Profil",
    detailMitra: "Detail Mitra", detailTagihan: "Detail Tagihan", detailProduk: "Detail Produk"
};
const main = document.getElementById("main-content");
const dialog = document.getElementById("action-dialog");
const form = document.getElementById("action-form");
const dialogFields = document.getElementById("dialog-fields");
let currentPage = "home";
let selectedId = null;
let invoiceFilter = "Semua";
let toastTimer;

function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, (character) => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    })[character]);
}

function rupiah(amount) {
    return new Intl.NumberFormat("id-ID", {
        style: "currency", currency: "IDR", maximumFractionDigits: 0
    }).format(amount).replace(/\u00a0/g, " ");
}

function statusClass(status) {
    if (["Lunas", "Aktif", "Terkirim", "Tersedia"].includes(status)) return "status-paid";
    if (["Stok menipis", "Dibatalkan"].includes(status)) return "status-low";
    return "status-pending";
}

function badge(status) {
    return `<span class="status ${statusClass(status)}">${escapeHTML(status)}</span>`;
}

function pageHeading(title, description, buttonLabel, action) {
    return `<div class="page-heading"><div><h1>${title}</h1><p>${description}</p></div>
        ${buttonLabel ? `<button class="button button-primary" type="button" data-action="${action}"><span class="plus">+</span>${buttonLabel}</button>` : ""}</div>`;
}

function invoiceRows(invoices) {
    if (!invoices.length) return `<tr><td class="empty-state" colspan="5">Tidak ada tagihan yang cocok.</td></tr>`;
    return invoices.map((invoice) => `<tr data-record="${escapeHTML(`${invoice.id} ${invoice.partner} ${invoice.status}`.toLowerCase())}">
        <td class="table-primary">${escapeHTML(invoice.id)}<span class="table-sub">${escapeHTML(invoice.date)}</span></td>
        <td>${escapeHTML(invoice.partner)}</td><td>${rupiah(invoice.amount)}</td><td>${badge(invoice.status)}</td>
        <td><button class="table-action" type="button" data-action="invoice-detail" data-id="${escapeHTML(invoice.id)}">Detail</button></td>
    </tr>`).join("");
}

function dashboardTemplate() {
    const outstanding = data.invoices.filter((invoice) => invoice.status !== "Lunas");
    const recent = data.invoices.slice(0, 4);
    return `<section class="welcome-banner">
        <div class="welcome-copy"><p class="eyebrow">SENANG MELIHAT ANDA KEMBALI</p><h1>Selamat pagi, Fauzi👋</h1>
        <p>Ini ringkasan aktivitas SHA'S YOGHURT. Semoga harimu menyenangkan!</p></div><div class="banner-date" id="banner-date"></div>
    </section>
    <section class="stats-grid" aria-label="Ringkasan usaha">
        <article class="stat-card"><div class="stat-top"><span>Total penjualan</span><span class="stat-icon">↗</span></div><strong class="stat-value">Rp 48,2 jt</strong><div class="stat-foot"><span class="trend-up">↑ 12,8%</span><span>dari bulan lalu</span></div></article>
        <article class="stat-card"><div class="stat-top"><span>Tagihan belum lunas</span><span class="stat-icon amber">▤</span></div><strong class="stat-value">${outstanding.length + 5} tagihan</strong><div class="stat-foot"><span>${rupiah(outstanding.reduce((total, invoice) => total + invoice.amount, 0))}</span><span>perlu ditindaklanjuti</span></div></article>
        <article class="stat-card"><div class="stat-top"><span>Mitra aktif</span><span class="stat-icon blue">♧</span></div><strong class="stat-value">${data.partners.length + 24} mitra</strong><div class="stat-foot"><span class="trend-up">↑ 3 mitra baru</span><span>bulan ini</span></div></article>
        <article class="stat-card"><div class="stat-top"><span>Pengiriman hari ini</span><span class="stat-icon lilac">⇢</span></div><strong class="stat-value">${data.distributions.filter((item) => item.status !== "Terkirim").length + 4} pesanan</strong><div class="stat-foot"><span>2 sedang dikirim</span></div></article>
    </section>
    <div class="dashboard-grid">
        <section class="panel">
            <div class="panel-heading"><div><h2>Ringkasan penjualan</h2><p>Performa penjualan dalam 7 hari terakhir</p></div>
                <select class="select-field" aria-label="Periode penjualan"><option>7 hari terakhir</option><option>30 hari terakhir</option></select>
            </div>
            <div class="chart-area"><div class="chart-summary"><div><strong>Rp 12.840.000</strong><br><small>Total penjualan minggu ini</small></div><div class="chart-legend"><i></i>Penjualan</div></div>
                <svg class="chart" viewBox="0 0 640 180" role="img" aria-label="Grafik penjualan meningkat sepanjang minggu">
                    <defs><linearGradient id="chart-fill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stop-color="#8FB4E3" stop-opacity=".24"/><stop offset="100%" stop-color="#8FB4E3" stop-opacity="0"/></linearGradient></defs>
                    <line class="chart-gridline" x1="38" y1="20" x2="630" y2="20"/><line class="chart-gridline" x1="38" y1="62" x2="630" y2="62"/>
                    <line class="chart-gridline" x1="38" y1="104" x2="630" y2="104"/><line class="chart-gridline" x1="38" y1="146" x2="630" y2="146"/>
                    <text class="chart-label" x="0" y="23">4 jt</text><text class="chart-label" x="0" y="65">3 jt</text><text class="chart-label" x="0" y="107">2 jt</text><text class="chart-label" x="0" y="149">1 jt</text>
                    <path class="chart-area-fill" d="M45 117 C75 107 87 86 130 96 S188 127 220 86 S274 83 310 71 S362 95 397 65 S450 77 487 48 S550 59 580 30 S610 43 628 20 L628 147 L45 147 Z"/>
                    <path class="chart-line" d="M45 117 C75 107 87 86 130 96 S188 127 220 86 S274 83 310 71 S362 95 397 65 S450 77 487 48 S550 59 580 30 S610 43 628 20"/>
                    <text class="chart-label" x="43" y="170">Sen</text><text class="chart-label" x="137" y="170">Sel</text><text class="chart-label" x="231" y="170">Rab</text><text class="chart-label" x="325" y="170">Kam</text><text class="chart-label" x="419" y="170">Jum</text><text class="chart-label" x="513" y="170">Sab</text><text class="chart-label" x="605" y="170">Min</text>
                </svg>
            </div>
        </section>
        <section class="panel">
            <div class="panel-heading"><div><h2>Akses cepat</h2><p>Kelola aktivitas usaha Anda</p></div></div>
            <div class="quick-actions">
                <button class="quick-action" type="button" data-action="create-partner"><span class="quick-action-icon">♧</span><span>Tambah<br>mitra</span></button>
                <button class="quick-action" type="button" data-action="create-invoice"><span class="quick-action-icon">▤</span><span>Buat<br>tagihan</span></button>
                <button class="quick-action" type="button" data-action="create-distribution"><span class="quick-action-icon">⇢</span><span>Atur<br>pengiriman</span></button>
                <button class="quick-action" type="button" data-action="create-product"><span class="quick-action-icon">▦</span><span>Tambah<br>produk</span></button>
            </div>
        </section>
    </div>
    <section class="panel table-panel">
        <div class="panel-heading"><div><h2>Tagihan terbaru</h2><p>Pantau status pembayaran mitra</p></div><button class="text-link" type="button" data-page="tagihan">Lihat semua →</button></div>
        <div class="table-wrap"><table class="data-table"><thead><tr><th>NO. TAGIHAN</th><th>MITRA</th><th>TOTAL</th><th>STATUS</th><th></th></tr></thead><tbody>${invoiceRows(recent)}</tbody></table></div>
    </section>`;
}

function partnersTemplate() {
    const rows = data.partners.map((partner) => `<tr data-record="${escapeHTML(`${partner.id} ${partner.name} ${partner.address}`.toLowerCase())}">
        <td class="table-primary">${escapeHTML(partner.id)}</td><td class="table-primary">${escapeHTML(partner.name)}<span class="table-sub">${escapeHTML(partner.address)}</span></td>
        <td>${escapeHTML(partner.contact)}</td><td>${escapeHTML(partner.joined)}</td><td>${badge(partner.status)}</td>
        <td><button class="table-action" type="button" data-action="partner-detail" data-id="${escapeHTML(partner.id)}">Detail</button></td></tr>`).join("");
    return `${pageHeading("Mitra", "Kelola data dan pantau aktivitas seluruh mitra usaha.", "Tambah mitra", "create-partner")}
        <div class="toolbar"><div class="toolbar-left"><label class="search-field"><span aria-hidden="true">⌕</span><input type="search" placeholder="Cari nama atau alamat mitra..." aria-label="Cari mitra" data-search></label></div><div class="toolbar-right"><span class="table-sub">${data.partners.length} mitra terdaftar</span></div></div>
        <section class="panel"><div class="table-wrap"><table class="data-table"><thead><tr><th>ID MITRA</th><th>NAMA MITRA</th><th>NO. TELEPON</th><th>TANGGAL BERGABUNG</th><th>STATUS</th><th></th></tr></thead><tbody>${rows}</tbody></table></div><div class="empty-state empty-filter">Mitra tidak ditemukan.</div></section>`;
}

function invoicesTemplate() {
    const rows = invoiceRows(data.invoices);
    return `${pageHeading("Tagihan", "Kelola invoice dan pantau status pembayaran mitra.", "Buat tagihan", "create-invoice")}
        <div class="tabs" role="tablist" aria-label="Filter status tagihan">${["Semua", "Belum lunas", "Lunas"].map((item) => `<button class="tab-button ${invoiceFilter === item ? "is-active" : ""}" type="button" role="tab" aria-selected="${invoiceFilter === item}" data-invoice-filter="${item}">${item}${item === "Semua" ? ` (${data.invoices.length})` : ""}</button>`).join("")}</div>
        <section class="panel"><div class="table-wrap"><table class="data-table"><thead><tr><th>NO. TAGIHAN</th><th>MITRA</th><th>TOTAL</th><th>STATUS</th><th></th></tr></thead><tbody>${rows}</tbody></table></div><div class="empty-state empty-filter">Tagihan tidak ditemukan.</div></section>`;
}

function distributionsTemplate() {
    const rows = data.distributions.map((item) => `<tr data-record="${escapeHTML(`${item.id} ${item.partner} ${item.status}`.toLowerCase())}">
        <td class="table-primary">${escapeHTML(item.id)}</td><td class="table-primary">${escapeHTML(item.partner)}</td><td>${escapeHTML(item.items)}</td><td>${escapeHTML(item.date)}</td><td>${badge(item.status)}</td>
        <td><button class="table-action" type="button" data-action="advance-distribution" data-id="${escapeHTML(item.id)}">${item.status === "Terkirim" ? "Selesai" : "Perbarui"}</button></td></tr>`).join("");
    return `${pageHeading("Distribusi", "Atur jadwal dan pantau proses pengiriman produk.", "Buat pengiriman", "create-distribution")}
        <div class="toolbar"><div class="toolbar-left"><label class="search-field"><span aria-hidden="true">⌕</span><input type="search" placeholder="Cari nomor atau nama mitra..." aria-label="Cari distribusi" data-search></label></div></div>
        <section class="panel"><div class="table-wrap"><table class="data-table"><thead><tr><th>NO. PESANAN</th><th>MITRA</th><th>JUMLAH</th><th>JADWAL</th><th>STATUS</th><th></th></tr></thead><tbody>${rows}</tbody></table></div><div class="empty-state empty-filter">Pengiriman tidak ditemukan.</div></section>`;
}

function productsTemplate() {
    const rows = data.products.map((product) => `<tr data-record="${escapeHTML(`${product.id} ${product.name} ${product.size}`.toLowerCase())}">
        <td class="table-primary">${escapeHTML(product.id)}</td><td><span class="inventory-cell"><span class="product-swatch">✿</span><span class="table-primary">${escapeHTML(product.name)}<span class="table-sub">${escapeHTML(product.size)}</span></span></span></td>
        <td>${rupiah(product.price)}</td><td>${product.stock} unit</td><td>${badge(product.stock < 15 ? "Stok menipis" : "Tersedia")}</td>
        <td><button class="table-action" type="button" data-action="product-detail" data-id="${escapeHTML(product.id)}">Detail</button></td></tr>`).join("");
    return `${pageHeading("Produk", "Kelola varian, harga, dan ketersediaan produk yoghurt.", "Tambah produk", "create-product")}
        <div class="toolbar"><div class="toolbar-left"><label class="search-field"><span aria-hidden="true">⌕</span><input type="search" placeholder="Cari nama produk..." aria-label="Cari produk" data-search></label></div><div class="toolbar-right"><span class="table-sub">${data.products.length} varian produk</span></div></div>
        <section class="panel"><div class="table-wrap"><table class="data-table"><thead><tr><th>KODE</th><th>NAMA PRODUK</th><th>HARGA</th><th>STOK</th><th>STATUS</th><th></th></tr></thead><tbody>${rows}</tbody></table></div><div class="empty-state empty-filter">Produk tidak ditemukan.</div></section>`;
}

function salesTemplate() {
    const rows = data.invoices.map((invoice) => `<tr data-record="${escapeHTML(`${invoice.id} ${invoice.partner}`.toLowerCase())}">
        <td class="table-primary">${escapeHTML(invoice.date)}</td><td>${escapeHTML(invoice.id)}</td><td class="table-primary">${escapeHTML(invoice.partner)}</td><td>${rupiah(invoice.amount)}</td><td>${badge(invoice.status)}</td></tr>`).join("");
    return `${pageHeading("Penjualan", "Ringkasan transaksi dan penjualan dari seluruh mitra.", null, null)}
        <section class="stats-grid">
            <article class="stat-card"><div class="stat-top"><span>Total penjualan</span><span class="stat-icon">↗</span></div><strong class="stat-value">Rp 48,2 jt</strong><div class="stat-foot"><span class="trend-up">↑ 12,8%</span><span>dari bulan lalu</span></div></article>
            <article class="stat-card"><div class="stat-top"><span>Transaksi</span><span class="stat-icon blue">▤</span></div><strong class="stat-value">128</strong><div class="stat-foot"><span>transaksi bulan ini</span></div></article>
            <article class="stat-card"><div class="stat-top"><span>Rata-rata transaksi</span><span class="stat-icon lilac">◉</span></div><strong class="stat-value">Rp 376 rb</strong><div class="stat-foot"><span>per transaksi</span></div></article>
            <article class="stat-card"><div class="stat-top"><span>Tagihan tertunda</span><span class="stat-icon amber">◷</span></div><strong class="stat-value">${data.invoices.filter((item) => item.status !== "Lunas").length} tagihan</strong><div class="stat-foot"><span>perlu ditindaklanjuti</span></div></article>
        </section><div class="toolbar"><div class="toolbar-left"><label class="search-field"><span aria-hidden="true">⌕</span><input type="search" placeholder="Cari transaksi..." aria-label="Cari transaksi" data-search></label></div></div>
        <section class="panel"><div class="table-wrap"><table class="data-table"><thead><tr><th>TANGGAL</th><th>NO. TRANSAKSI</th><th>MITRA</th><th>TOTAL</th><th>STATUS</th></tr></thead><tbody>${rows}</tbody></table></div><div class="empty-state empty-filter">Transaksi tidak ditemukan.</div></section>`;
}

function profileTemplate() {
    return `${pageHeading("Profil", "Informasi akun administrator SHA'S YOGHURT.", null, null)}
        <section class="detail-card"><div class="inventory-cell"><span class="avatar" style="width:48px;height:48px">FAK</span><div><h2>Fauzi Awaludin Kamal</h2><span class="table-sub">Administrator</span></div></div>
        <div class="detail-grid"><div class="detail-item"><small>Nama lengkap</small><strong>Fauzi Awaludin Kamal</strong></div><div class="detail-item"><small>Username</small><strong>admin01</strong></div><div class="detail-item"><small>Email</small><strong>fauzi@shasyoghurt.id</strong></div><div class="detail-item"><small>Hak akses</small><strong>Administrator</strong></div></div>
        <button class="button button-quiet" type="button" data-action="profile-notice">Keluar dari akun</button></section>`;
}

function detailTemplate() {
    if (currentPage === "detailMitra") {
        const partner = data.partners.find((item) => item.id === selectedId) || data.partners[0];
        const partnerInvoices = data.invoices.filter((item) => item.partnerId === partner.id);
        return `${pageHeading("Detail mitra", "Informasi lengkap dan riwayat mitra.", null, null)}
            <section class="detail-card"><h2>${escapeHTML(partner.name)}</h2><div class="detail-grid">
                <div class="detail-item"><small>ID mitra</small><strong>${escapeHTML(partner.id)}</strong></div><div class="detail-item"><small>Status</small><strong>${badge(partner.status)}</strong></div>
                <div class="detail-item"><small>Alamat</small><strong>${escapeHTML(partner.address)}</strong></div><div class="detail-item"><small>No. telepon</small><strong>${escapeHTML(partner.contact)}</strong></div>
                <div class="detail-item"><small>Tanggal bergabung</small><strong>${escapeHTML(partner.joined)}</strong></div><div class="detail-item"><small>Total tagihan</small><strong>${partnerInvoices.length} invoice</strong></div></div>
                <div class="detail-actions"><button class="button button-quiet" type="button" data-page="mitra">Kembali ke mitra</button><button class="button button-primary" type="button" data-action="create-invoice">Buat tagihan</button></div></section>`;
    }
    if (currentPage === "detailProduk") {
        const product = data.products.find((item) => item.id === selectedId) || data.products[0];
        return `${pageHeading("Detail produk", "Informasi harga dan ketersediaan produk.", null, null)}
            <section class="detail-card"><h2>${escapeHTML(product.name)}</h2><div class="detail-grid">
                <div class="detail-item"><small>Kode produk</small><strong>${escapeHTML(product.id)}</strong></div><div class="detail-item"><small>Ukuran</small><strong>${escapeHTML(product.size)}</strong></div>
                <div class="detail-item"><small>Harga</small><strong>${rupiah(product.price)}</strong></div><div class="detail-item"><small>Stok</small><strong>${product.stock} unit</strong></div>
            </div><div class="detail-actions"><button class="button button-quiet" type="button" data-page="produk">Kembali ke produk</button></div></section>`;
    }
    const invoice = data.invoices.find((item) => item.id === selectedId) || data.invoices[0];
    return `${pageHeading("Detail tagihan", "Rincian pembayaran dan status invoice.", null, null)}
        <section class="detail-card"><h2>${escapeHTML(invoice.id)}</h2><div class="detail-grid">
            <div class="detail-item"><small>Mitra</small><strong>${escapeHTML(invoice.partner)}</strong></div><div class="detail-item"><small>Status</small><strong>${badge(invoice.status)}</strong></div>
            <div class="detail-item"><small>Tanggal dibuat</small><strong>${escapeHTML(invoice.date)}</strong></div><div class="detail-item"><small>Jatuh tempo</small><strong>${escapeHTML(invoice.due)}</strong></div>
            <div class="detail-item"><small>Total tagihan</small><strong>${rupiah(invoice.amount)}</strong></div><div class="detail-item"><small>Metode pembayaran</small><strong>Transfer bank</strong></div></div>
            <div class="detail-actions"><button class="button button-quiet" type="button" data-page="tagihan">Kembali ke tagihan</button>${invoice.status !== "Lunas" ? `<button class="button button-primary" type="button" data-action="mark-paid" data-id="${escapeHTML(invoice.id)}">Tandai lunas</button>` : ""}</div></section>`;
}

const templates = {
    home: dashboardTemplate, mitra: partnersTemplate, penjualan: salesTemplate,
    tagihan: invoicesTemplate, distribusi: distributionsTemplate, produk: productsTemplate,
    profil: profileTemplate, detailMitra: detailTemplate, detailTagihan: detailTemplate, detailProduk: detailTemplate
};

function setActiveNavigation() {
    document.querySelectorAll("[data-page]").forEach((button) => {
        const selected = button.dataset.page === currentPage ||
            (currentPage === "detailMitra" && button.dataset.page === "mitra") ||
            (currentPage === "detailTagihan" && button.dataset.page === "tagihan") ||
            (currentPage === "detailProduk" && button.dataset.page === "produk");
        button.classList.toggle("is-active", selected);
        if (button.classList.contains("nav-link") || button.classList.contains("mobile-nav-link")) {
            if (selected) button.setAttribute("aria-current", "page");
            else button.removeAttribute("aria-current");
        }
    });
}

function renderPage(page, options = {}) {
    currentPage = templates[page] ? page : "home";
    main.innerHTML = templates[currentPage]();
    document.getElementById("breadcrumb-current").textContent = pageNames[currentPage];
    setActiveNavigation();
    if (currentPage === "home") {
        document.getElementById("banner-date").textContent = new Intl.DateTimeFormat("id-ID", {
            weekday: "long", day: "numeric", month: "long", year: "numeric"
        }).format(new Date());
    }
    if (!options.keepScroll) window.scrollTo({ top: 0, behavior: "smooth" });
}

function showToast(message) {
    const toast = document.getElementById("toast");
    toast.textContent = message;
    toast.classList.add("is-visible");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove("is-visible"), 2800);
}

function openDialog(kind) {
    const configs = {
        partner: {
            title: "Tambah mitra", submit: "Simpan mitra", fields: [
                ["name", "Nama toko", "text", "Contoh: Toko Sejahtera"],
                ["contact", "Nomor telepon", "tel", "08xxxxxxxxxx"],
                ["address", "Alamat", "textarea", "Alamat lengkap mitra"]
            ]
        },
        invoice: {
            title: "Buat tagihan", submit: "Simpan tagihan", fields: [
                ["partnerId", "Pilih mitra", "partner"],
                ["amount", "Total tagihan (Rp)", "number", "Contoh: 1500000"],
                ["due", "Tanggal jatuh tempo", "date"]
            ]
        },
        distribution: {
            title: "Buat pengiriman", submit: "Simpan pengiriman", fields: [
                ["partner", "Nama mitra", "text", "Nama toko tujuan"],
                ["items", "Jumlah produk", "text", "Contoh: 5 dus"],
                ["date", "Jadwal pengiriman", "date"]
            ]
        },
        product: {
            title: "Tambah produk", submit: "Simpan produk", fields: [
                ["name", "Nama produk", "text", "Contoh: Yoghurt Mangga"],
                ["size", "Ukuran kemasan", "text", "Contoh: 250 ml"],
                ["price", "Harga (Rp)", "number", "Contoh: 15000"],
                ["stock", "Stok awal (unit)", "number", "Contoh: 50"]
            ]
        }
    };
    const config = configs[kind];
    if (!config) return;
    dialog.dataset.kind = kind;
    document.getElementById("dialog-title").textContent = config.title;
    document.getElementById("dialog-submit").textContent = config.submit;
    dialogFields.innerHTML = config.fields.map(([name, label, type, placeholder]) => {
        let control;
        if (type === "partner") {
            control = `<select name="${name}" required><option value="">Pilih mitra</option>${data.partners.map((partner) => `<option value="${escapeHTML(partner.id)}">${escapeHTML(partner.name)}</option>`).join("")}</select>`;
        } else if (type === "textarea") {
            control = `<textarea name="${name}" placeholder="${escapeHTML(placeholder)}" required></textarea>`;
        } else {
            control = `<input name="${name}" type="${type}" ${placeholder ? `placeholder="${escapeHTML(placeholder)}"` : ""} ${type === "number" ? 'min="1" step="1"' : ""} required>`;
        }
        return `<div class="form-field"><label for="field-${name}">${label}</label>${control.replace(`name="${name}"`, `id="field-${name}" name="${name}"`)}</div>`;
    }).join("");
    dialog.showModal();
}

function addRecord(event) {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(form).entries());
    const kind = dialog.dataset.kind;
    if (kind === "partner") {
        data.partners.unshift({
            id: `MTR-${String(data.partners.length + 1).padStart(3, "0")}`,
            name: values.name.trim(), contact: values.contact.trim(), address: values.address.trim(),
            joined: new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", year: "numeric" }).format(new Date()),
            status: "Aktif"
        });
        renderPage("mitra", { keepScroll: true });
        showToast("Mitra baru berhasil ditambahkan.");
    } else if (kind === "invoice") {
        const partner = data.partners.find((item) => item.id === values.partnerId);
        if (!partner) return showToast("Pilih mitra terlebih dahulu.");
        data.invoices.unshift({
            id: `INV-${String(139 + data.invoices.length).padStart(4, "0")}`,
            partnerId: partner.id, partner: partner.name,
            date: new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", year: "numeric" }).format(new Date()),
            due: new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(`${values.due}T00:00:00`)),
            amount: Number(values.amount), status: "Belum lunas"
        });
        renderPage(currentPage === "home" ? "home" : "tagihan", { keepScroll: true });
        showToast("Tagihan berhasil dibuat.");
    } else if (kind === "distribution") {
        data.distributions.unshift({
            id: `DST-${String(85 + data.distributions.length).padStart(4, "0")}`,
            partner: values.partner.trim(), date: new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short" }).format(new Date(`${values.date}T00:00:00`)),
            items: values.items.trim(), status: "Diproses"
        });
        renderPage("distribusi", { keepScroll: true });
        showToast("Pengiriman berhasil dijadwalkan.");
    } else if (kind === "product") {
        data.products.unshift({
            id: `PRD-${String(data.products.length + 1).padStart(3, "0")}`,
            name: values.name.trim(), size: values.size.trim(), price: Number(values.price), stock: Number(values.stock)
        });
        renderPage("produk", { keepScroll: true });
        showToast("Produk berhasil ditambahkan.");
    }
    dialog.close();
    form.reset();
}

function filterRows(query = "") {
    const normalized = query.trim().toLowerCase();
    let visibleRows = 0;
    main.querySelectorAll("tbody tr[data-record]").forEach((row) => {
        const matchesText = row.dataset.record.includes(normalized);
        const matchesStatus = currentPage !== "tagihan" || invoiceFilter === "Semua" || row.textContent.includes(invoiceFilter);
        row.hidden = !matchesText || !matchesStatus;
        if (!row.hidden) visibleRows += 1;
    });
    const emptyMessage = main.querySelector(".empty-filter");
    if (emptyMessage) emptyMessage.style.display = visibleRows ? "none" : "block";
}

function getDialogKind(action) {
    return {
        "create-partner": "partner", "create-invoice": "invoice",
        "create-distribution": "distribution", "create-product": "product"
    }[action];
}

document.addEventListener("click", (event) => {
    const pageButton = event.target.closest("[data-page]");
    if (pageButton) {
        event.preventDefault();
        renderPage(pageButton.dataset.page);
        return;
    }

    const actionButton = event.target.closest("[data-action]");
    if (!actionButton) return;
    const action = actionButton.dataset.action;
    const kind = getDialogKind(action);
    if (kind) {
        openDialog(kind);
    } else if (action === "invoice-detail") {
        selectedId = actionButton.dataset.id;
        renderPage("detailTagihan");
    } else if (action === "partner-detail") {
        selectedId = actionButton.dataset.id;
        renderPage("detailMitra");
    } else if (action === "product-detail") {
        selectedId = actionButton.dataset.id;
        renderPage("detailProduk");
    } else if (action === "mark-paid") {
        const invoice = data.invoices.find((item) => item.id === actionButton.dataset.id);
        if (invoice) {
            invoice.status = "Lunas";
            renderPage("detailTagihan", { keepScroll: true });
            showToast(`${invoice.id} ditandai lunas.`);
        }
    } else if (action === "advance-distribution") {
        const distribution = data.distributions.find((item) => item.id === actionButton.dataset.id);
        if (distribution && distribution.status !== "Terkirim") {
            distribution.status = distribution.status === "Diproses" ? "Dalam perjalanan" : "Terkirim";
            renderPage("distribusi", { keepScroll: true });
            showToast(`Status ${distribution.id} diperbarui.`);
        }
    } else if (action === "profile-notice") {
        showToast("Fitur keluar akun belum terhubung ke sistem autentikasi.");
    }
});

document.addEventListener("input", (event) => {
    if (event.target.matches("[data-search]")) filterRows(event.target.value);
});

document.addEventListener("click", (event) => {
    const filterButton = event.target.closest("[data-invoice-filter]");
    if (!filterButton) return;
    invoiceFilter = filterButton.dataset.invoiceFilter;
    renderPage("tagihan", { keepScroll: true });
    filterRows();
});

form.addEventListener("submit", addRecord);
document.querySelectorAll("[data-close-dialog], .dialog-close").forEach((button) => button.addEventListener("click", () => dialog.close()));
dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
});
document.querySelector(".notification-button").addEventListener("click", () => showToast("Anda tidak memiliki notifikasi baru."));
document.getElementById("today-date").textContent = new Intl.DateTimeFormat("id-ID", {
    weekday: "short", day: "numeric", month: "short", year: "numeric"
}).format(new Date());
renderPage("home");
