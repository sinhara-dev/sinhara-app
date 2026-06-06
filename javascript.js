const ALLOWED_USERS = [
  "sinharacreations@gmail.com",
  // "vijinvv125@gmail.com",
  "dayanandanaap@gmail.com",
];

function parseJwt(token) {
  return JSON.parse(atob(token.split(".")[1]));
}

function handleCredentialResponse(response) {
  const payload = parseJwt(response.credential);

  if (!ALLOWED_USERS.includes(payload.email)) {
    alert("Access denied");
    return;
  }

  // store real session token
  localStorage.setItem("google_token", response.credential);

  showApp();
}

function tryAutoLogin() {
  const token = localStorage.getItem("google_token");

  if (!token) return false;

  try {
    const payload = parseJwt(token);

    const now = Math.floor(Date.now() / 1000);
    const expired = payload.exp < now;

    if (!expired && ALLOWED_USERS.includes(payload.email)) {
      showApp();
      return true;
    }
  } catch (e) {
    console.log("Bad token");
  }

  return false;
}

window.onload = function () {
  switchTab("home");

  const currentMonth = getCurrentMonthName();

  const label = document.getElementById("selectedMonthLabel");
  const select = document.getElementById("monthSelect");

  if (label) label.innerText = currentMonth;
  if (select) select.value = currentMonth;

  // 1. Try stored session first (FAST, no Google call)
  if (tryAutoLogin()) return;

  // 2. Initialize Google login only if needed
  google.accounts.id.initialize({
    client_id:
      "382055113607-tsn501fgtlisnflhf7ldeg87mh8f32n5.apps.googleusercontent.com",
    callback: handleCredentialResponse,
    use_fedcm_for_prompt: true,
  });

  // 3. Try silent login
  google.accounts.id.prompt((notification) => {
    if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
      showLogin();
    }
  });
};

function showApp() {
  document.getElementById("loginScreen").style.display = "none";
  document.getElementById("appScreen").style.display = "block";
}

function showLogin() {
  document.getElementById("loginScreen").style.display = "flex";
  document.getElementById("appScreen").style.display = "none";
}

const MARKETING_TEAMS = [
  "Sinhara",
  "Sringa",
  "Jindil bindil",
  "Zara zone",
  "Ishis",
];

let productsCache = [];
let expenseCache = {};
let salesCache = {};
let activeTab = "";

function loadInventoryProducts() {
  showLoader();

  const cached = localStorage.getItem("inventoryProducts");

  if (cached) {
    renderProducts(JSON.parse(cached));
    hideLoader();
  }

  // always refresh in background
  refreshProducts();
}

async function refreshProducts() {
  setSyncing(true);

  try {
    const res = await fetch(GAS_URL + "?action=getInventoryProducts");

    const response = await res.json();

    if (!response.success) {
      throw new Error(response.error || "Failed to load inventory products");
    }

    const products = response.data;

    localStorage.setItem("inventoryProducts", JSON.stringify(products));

    renderProducts(products);
    updateInventoryHeader(products);
  } catch (err) {
    showStatus(err.message, true);
  } finally {
    setSyncing(false);
  }
}

function setSyncing(isSyncing) {
  const btn = document.getElementById("syncBtn");

  if (!btn) return;

  btn.classList.toggle("syncing", isSyncing);

  // if (isSyncing) {
  //   btn.classList.add("syncing");
  //   btn.style.opacity = "0.6";
  // } else {
  //   btn.classList.remove("syncing");
  //   btn.style.opacity = "1";
  // }
}

function updateInventoryHeader(products) {
  let totalProducts = 0;
  let totalValue = 0;

  products.forEach((p) => {
    const amount = Number(p.amount) || 0;
    const qty = Number(p.quantity) || 0;
    totalValue += amount * qty;
    totalProducts += qty;
  });

  document.getElementById("totalProducts").innerText =
    Number(totalProducts).toLocaleString("en-IN");
  document.getElementById("totalValue").innerText =
    "₹" + Number(totalValue).toLocaleString("en-IN");
}

function renderProducts(products) {
  productsCache = products;

  const gallery = document.getElementById("inventory_product_gallery");

  if (!gallery) {
    console.error("Gallery not found");
    return;
  }

  gallery.innerHTML = "";

  products.forEach((product) => {
    const card = document.createElement("div");
    card.className = "product-card";

    card.innerHTML = `
  <div
    class="card-loader"
    id="loader_${product.id}"
    style="display:none;">
    Updating...
  </div>

  <div class="product-top-row">

    <!-- Column 1 -->
    <div class="col-img">
      <img
        src="${product.thumbnailUrl}"
        onclick="showImagePreview('${product.thumbnailUrl}')"
      />
    </div>

    <!-- Column 2 -->
    <div class="col-info">

      <div class="amount">
        ₹${formatAmount(product.amount)}
      </div>

      <div
        class="stock"
        id="stock_${product.id}">
        Stock: ${product.quantity}
      </div>

    </div>

    <!-- Column 3 -->
    <div class="col-id">
      #${product.id}
    </div>

    <!-- Column 4 -->
    <div class="col-actions">

      <button
        class="sold-btn"
        onclick='openSoldDialog(event, ${product.id})'>
        SOLD
      </button>

      <button
        class="update-btn"
        onclick='openStockDialog(event, ${product.id})'>
        UPDATE STOCK
      </button>

    </div>

  </div>

  <div class="product-name">
    ${product.name}
  </div>
`;

    gallery.appendChild(card);
  });
}

function openSoldDialog(event, productId) {
  event.stopPropagation();

  const product = productsCache.find((p) => Number(p.id) === Number(productId));

  if (!product) {
    showStatus("Product not found", true);
    return;
  }

  const teams = MARKETING_TEAMS.map((team) => `<option>${team}</option>`).join(
    "",
  );

  const today = new Date().toISOString().split("T")[0];

  openActionModal(
    "Record Sale",
    `
    <div
  style="
    display:flex;
    gap:1rem;
    margin-bottom:1rem;
    align-items:center;
  ">

  <img
    src="${product.thumbnailUrl}"
    style="
      width:4rem;
      height:4rem;
      border-radius:0.5rem;
      object-fit:cover;
    ">

  <div>

    <div
      style="
        font-size:1rem;
        font-weight:bold;
      ">
      ${product.name}
    </div>

    <div>
      ₹${formatAmount(product.amount)}
    </div>

    <div>
      Current Stock:
      ${product.quantity}
    </div>

  </div>

</div>
      <label>Quantity</label>

      <input
        id="soldQuantity"
        type="number"
        min="1"
        value="1">

      <label>Marketing Team</label>

      <select id="soldMarketingTeam">
        ${teams}
      </select>

      <label>Sale Date</label>

      <input
        id="soldDate"
        type="date"
        value="${today}">

      <button
        style="margin-top:1rem;"
        onclick="submitSale(${product.id})">

        SUBMIT

      </button>
    `,
  );
}

function openStockDialog(event, productId) {
  event.stopPropagation();

  const product = productsCache.find((p) => Number(p.id) === Number(productId));

  if (!product) {
    showStatus("Product not found", true);
    return;
  }

  openActionModal(
    "Update Stock",
    `
    <div
  style="
    display:flex;
    gap:1rem;
    margin-bottom:1rem;
    align-items:center;
  ">

  <img
    src="${product.thumbnailUrl}"
    style="
      width:4rem;
      height:4rem;
      border-radius:0.5rem;
      object-fit:cover;
    ">

  <div>

    <div
      style="
        font-size:1rem;
        font-weight:bold;
      ">
      ${product.name}
    </div>

    <div>
      ₹${formatAmount(product.amount)}
    </div>

    <div>
      Current Stock:
      ${product.quantity}
    </div>

  </div>

</div>
      <label>
        Quantity To Add
      </label>

      <input
        id="stockQuantity"
        type="number"
        min="1"
        value="1">

      <button
        style="margin-top:1rem;"
        onclick="submitStockUpdate(${product.id})">

        SUBMIT

      </button>
    `,
  );
}

async function submitSale(productId) {
  const quantity = Number(document.getElementById("soldQuantity").value);

  const team = document.getElementById("soldMarketingTeam").value;

  const date = document.getElementById("soldDate").value;

  closeActionModal();

  const loader = document.getElementById(`loader_${productId}`);

  loader.style.display = "flex";

  try {
    const res = await fetch(GAS_URL, {
      method: "POST",
      body: JSON.stringify({
        action: "recordSale",
        productId,
        quantity,
        marketingTeam: team,
        saleDate: date,
      }),
    });

    const response = await res.json();

    if (!response.success) {
      throw new Error(response.error || "Failed to record sale");
    }

    await refreshProducts();

    showStatus("Sale recorded");
  } catch (err) {
    showStatus(err.message, true);
  } finally {
    loader.style.display = "none";
  }
}

async function submitStockUpdate(productId) {
  const quantity = Number(document.getElementById("stockQuantity").value);

  closeActionModal();

  const loader = document.getElementById(`loader_${productId}`);

  loader.style.display = "flex";

  try {
    const res = await fetch(GAS_URL, {
      method: "POST",
      body: JSON.stringify({
        action: "updateInventoryStock",
        productId,
        quantityToAdd: quantity,
      }),
    });

    const response = await res.json();

    if (!response.success) {
      throw new Error(response.error || "Failed to update stock");
    }

    await refreshProducts();

    showStatus("Stock updated");
  } catch (err) {
    showStatus(err.message, true);
  } finally {
    loader.style.display = "none";
  }
}

function formatAmount(amount) {
  return Number(amount).toLocaleString("en-IN");
}

async function refreshDashboard() {
  setDashboardLoading(true);

  const icon = document.getElementById("dashboardRefreshIcon");

  icon.classList.add("dashboard-syncing");

  try {
    const res = await fetch(GAS_URL + "?action=getDashboardData");

    const response = await res.json();

    if (!response.success) {
      throw new Error(response.error || "Failed to refresh dashboard");
    }

    setDashboardValues(response.data);

    showStatus("Dashboard updated");
  } catch (err) {
    showStatus(err.message, true);
  } finally {
    icon.classList.remove("dashboard-syncing");
  }
}

function changeDelta(event, productId, change) {
  event.stopPropagation();

  const el = document.getElementById(`delta_${productId}`);

  let value = Number(el.innerText);
  value = Math.max(1, value + change);

  el.innerText = value;
}

async function confirmUpdateStock(productId, currentStock) {
  const delta = Number(document.getElementById(`delta_${productId}`).innerText);

  const ok = confirm(`Add ${delta} to stock?`);

  if (!ok) return;

  const btn = document.getElementById(`update_btn_${productId}`);

  const loader = document.getElementById(`loader_${productId}`);

  btn.disabled = true;
  loader.style.display = "block";

  try {
    const res = await fetch(GAS_URL, {
      method: "POST",
      body: JSON.stringify({
        action: "updateInventoryStock",
        productId,
        quantityToAdd: delta,
      }),
    });

    const response = await res.json();

    if (!response.success) {
      throw new Error(response.error || "Failed to update stock");
    }

    const newQty = currentStock + delta;

    document.getElementById(`stock_${productId}`).innerText =
      `Stock: ${newQty}`;

    document.getElementById(`delta_${productId}`).innerText = "1";

    showStatus(`Stock updated → ${newQty}`);
  } catch (err) {
    showStatus(err.message, true);
  } finally {
    btn.disabled = false;
    loader.style.display = "none";
  }
}

function truncate(text, max) {
  if (!text) return "";
  return text.length > max ? text.substring(0, max) + "..." : text;
}

function incrementStockInput(event, productId) {
  event.stopPropagation();

  const input = document.getElementById(`stock_input_${productId}`);

  input.value = Number(input.value) + 1;
}

function decrementStockInput(event, productId) {
  event.stopPropagation();

  const input = document.getElementById(`stock_input_${productId}`);

  const value = Number(input.value);

  if (value > 1) {
    input.value = value - 1;
  }
}

async function addStock(event, productId) {
  event.stopPropagation();

  const quantity = Number(
    document.getElementById(`stock_input_${productId}`).value,
  );

  showLoader();

  try {
    const res = await fetch(GAS_URL, {
      method: "POST",
      body: JSON.stringify({
        action: "updateInventoryStock",
        productId,
        quantityToAdd: quantity,
      }),
    });

    const response = await res.json();

    if (!response.success) {
      throw new Error(response.error || "Failed to update stock");
    }

    await refreshProducts();

    showStatus(`Stock updated.\nNew Qty: ${response.data.newQuantity}`);
  } catch (err) {
    showStatus(err.message, true);
  } finally {
    hideLoader();
  }
}

let selectedProduct = null;

function selectProduct(product, card) {
  selectedProduct = product;

  document.querySelectorAll(".product-card").forEach((c) => {
    c.classList.remove("selected-product");
  });

  card.classList.add("selected-product");
}

function showInventoryForm() {
  const section = document.getElementById("inventorySection");

  if (section.style.display === "none") {
    section.style.display = "block";
  } else {
    section.style.display = "none";
  }
}

function showUpdateExistingProductForm() {
  const section = document.getElementById("inventory_update_existing_product");

  if (section.style.display === "none") {
    section.style.display = "block";
    loadInventoryProducts();
  } else {
    section.style.display = "none";
  }
}

function showAddNewProductForm() {
  document.body.classList.add("modal-open");
  document.getElementById("inventory_add_new_product").style.display = "block";

  const fab = document.querySelector(".fab");
  if (fab) fab.style.display = "none";
}

function hideAddNewProductForm() {
  document.body.classList.remove("modal-open");
  document.getElementById("inventory_add_new_product").style.display = "none";

  const fab = document.querySelector(".fab");
  if (fab) fab.style.display = "flex";
}

function showLoader() {
  document.getElementById("loadingSpinner").style.display = "flex";
}

function hideLoader() {
  document.getElementById("loadingSpinner").style.display = "none";
}

async function updateInventoryAddNewProduct() {
  const submitButton = document.getElementById(
    "inventory_add_new_product_btn_submit",
  );

  const productName = document.getElementById(
    "inventory_add_new_product_name",
  ).value;

  if (!productName.trim()) {
    showStatus("Product name is required", true);
    return;
  }

  const amount = Number(
    document.getElementById("inventory_add_new_product_amount").value,
  );

  if (amount <= 0) {
    showStatus("Amount is required", true);
    return;
  }

  const expense = Number(
    document.getElementById("inventory_add_new_product_manufacturing_cost")
      .value,
  );

  const quantity = Number(
    document.getElementById("inventory_add_new_product_quantity").value,
  );

  const file = document.getElementById("inventory_add_new_product_photo")
    .files[0];

  if (!file) {
    showStatus("Please select a product photo", true);
    return;
  }

  submitButton.disabled = true;
  showLoader();

  try {
    const base64 = await new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        resolve(e.target.result.split(",")[1]);
      };

      reader.onerror = reject;

      reader.readAsDataURL(file);
    });

    const res = await fetch(GAS_URL, {
      method: "POST",
      body: JSON.stringify({
        action: "addNewProduct",
        productName,
        amount,
        expense,
        quantity,
        base64Data: base64,
        mimeType: file.type,
      }),
    });

    const response = await res.json();

    if (!response.success) {
      throw new Error(response.error || "Failed to create product");
    }

    await refreshProducts();

    showStatus("Product created.\nID: " + response.data.productId);

    clearInventoryAddNewProductForm();

    hideAddNewProductForm();
  } catch (err) {
    showStatus(err.message, true);
  } finally {
    hideLoader();

    submitButton.disabled = false;
  }
}

function switchTab(tab) {
  activeTab = tab;

  const homeView = document.getElementById("homeView");

  const productsView = document.getElementById("productsView");

  const expensesView = document.getElementById("expensesView");

  const salesView = document.getElementById("salesView");

  const expenseFab = document.getElementById("expenseFab");

  const tabs = document.querySelectorAll(".tab");

  // reset all tabs
  tabs.forEach((t) => t.classList.remove("active"));

  // hide everything first (important part)
  [homeView, productsView, expensesView, salesView].forEach((view) => {
    view.style.display = "none";
  });

  if (expenseFab) expenseFab.style.display = "none";

  // show selected tab
  if (tab === "home") {
    homeView.style.display = "block";
    tabs[0].classList.add("active");

    loadDashboard();
  } else if (tab === "products") {
    productsView.style.display = "block";
    tabs[1].classList.add("active");

    const fab = document.querySelector(".fab");
    if (fab) fab.style.display = "flex";

    renderCachedProducts();
  } else if (tab === "expenses") {
    expensesView.style.display = "block";
    tabs[2].classList.add("active");

    if (expenseFab) expenseFab.style.display = "flex";

    loadExpenseHeader(getCurrentMonthName());
  } else if (tab === "sales") {
    salesView.style.display = "block";
    tabs[3].classList.add("active");

    loadSalesData(getCurrentMonthName());
  }
}

function openAddExpense() {
  const today = new Date().toISOString().split("T")[0];

  openActionModal(
    "Add Expense",
    `
    <label>Date</label>
    <input id="expenseDate" type="date" value="${today}"/>  
    
    <label>Item</label>
    <input type="text" id="expenseItem">

    <label>Amount</label>
    <input type="number" id="expenseAmount">

    <label>Type</label>
    <select id="expenseType">
      <option value="Product">Product</option>
      <option value="Operational">Operational</option>
    </select>

    <button style="margin-top:1rem;" onclick="submitExpense()">
      SAVE
    </button>
  `,
  );
}

async function submitExpense() {
  const date = document.getElementById("expenseDate").value;
  const item = document.getElementById("expenseItem").value.trim();
  const amount = Number(document.getElementById("expenseAmount").value);
  const type = document.getElementById("expenseType").value;

  const month = new Date(date).toLocaleString("en-US", { month: "long" });

  if (!date || !item || !amount || amount <= 0 || !type) {
    showStatus("Fill all fields properly", true);
    return;
  }

  closeActionModal();

  showLoader?.();

  try {
    const res = await fetch(GAS_URL, {
      method: "POST",
      body: JSON.stringify({
        action: "addExpense",
        date,
        item,
        amount,
        type,
        month,
      }),
    });

    const response = await res.json();

    if (!response.success) {
      throw new Error(response.error || "Failed to add expense");
    }

    // refresh current month view
    delete expenseCache[month];
    loadExpenseHeader(month);

    showStatus("Expense added");
  } catch (err) {
    showStatus(err.message, true);
  } finally {
    hideLoader?.();
  }
}

function openMonthPicker() {
  document.getElementById("monthModal").style.display = "flex";
}

function closeMonthPicker() {
  document.getElementById("monthModal").style.display = "none";
}

function applyMonth() {
  const month = document.getElementById("monthSelect").value;

  closeMonthPicker();

  if (activeTab === "expenses") {
    document.getElementById("selectedMonthLabel").innerText = month;
    loadExpenseHeader(month);
  } else if (activeTab === "sales") {
    document.getElementById("selectedMonthLabelSales").innerText = month;
    loadSalesData(month);
  }
}

function openActionModal(title, bodyHtml) {
  document.getElementById("actionModalTitle").innerHTML = title;

  document.getElementById("actionModalBody").innerHTML = bodyHtml;

  document.getElementById("actionModal").style.display = "flex";
}

function closeActionModal() {
  document.getElementById("actionModal").style.display = "none";

  document.getElementById("actionModalBody").innerHTML = "";
}

async function loadExpenseHeader(month) {
  setExpenseLoading(true);

  if (expenseCache[month]) {
    updateExpenseHeader(expenseCache[month].summary);
    renderExpenseList(expenseCache[month].list);
    setExpenseLoading(false);
    return;
  }

  try {
    const res = await fetch(
      GAS_URL +
        "?action=getExpenseSummary" +
        "&month=" +
        encodeURIComponent(month),
    );

    const response = await res.json();

    if (!response.success) {
      throw new Error(response.error || "Failed to load expense summary");
    }

    const data = response.data;

    setExpenseLoading(false);

    updateExpenseHeader(data.summary);
    renderExpenseList(data.list);

    expenseCache[month] = data;
  } catch (err) {
    setExpenseLoading(false);

    showStatus(err.message, true);
  }
}

function updateExpenseHeader(data) {
  if (!data) return;

  const totalEl = document.getElementById("expenseTotal");
  const productEl = document.getElementById("expenseProductCost");
  const opEl = document.getElementById("expenseOperational");

  if (!totalEl || !productEl || !opEl) {
    console.error("Expense header DOM missing");
    return;
  }

  totalEl.innerText = "₹" + Number(data.total || 0).toLocaleString("en-IN");

  productEl.innerText =
    "₹" + Number(data.productCost || 0).toLocaleString("en-IN");

  opEl.innerText =
    "₹" + Number(data.operationalExpense || 0).toLocaleString("en-IN");
}

function renderExpenseList(rows) {
  const container = document.getElementById("expenseList");

  container.innerHTML = "";

  rows.forEach((r) => {
    const card = document.createElement("div");
    card.className = "expense-card";

    card.innerHTML = `
      <div class="expense-row">

        <!-- Date -->
        <div class="expense-date">
          ${r.date}
        </div>

        <!-- Main content -->
        <div class="expense-main">

          <div class="expense-item">
            ${r.item}
          </div>

          <div class="expense-bottom">
            <div class="expense-amount">
              ₹${formatAmount(r.amount)}
            </div>

            <div class="expense-type ${r.typeClass}">
              ${r.type}
            </div>
          </div>

        </div>

      </div>
    `;

    container.appendChild(card);
  });
}

function setExpenseLoading(isLoading) {
  const ids = ["expenseTotal", "expenseProductCost", "expenseOperational"];

  ids.forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;

    if (isLoading) {
      el.classList.add("skeleton");
      el.textContent = "██████";
    } else {
      el.classList.remove("skeleton");
    }
  });

  const list = document.getElementById("expenseList");

  if (!list) return;

  if (isLoading) {
    list.innerHTML = `
      <div class="expense-skeleton">
        <div class="skeleton-line"></div>
        <div class="skeleton-line short"></div>
      </div>
      <div class="expense-skeleton">
        <div class="skeleton-line"></div>
        <div class="skeleton-line short"></div>
      </div>
      <div class="expense-skeleton">
        <div class="skeleton-line"></div>
        <div class="skeleton-line short"></div>
      </div>
    `;
  }
}

async function loadSalesData(month) {
  if (salesCache[month]) {
    updateSalesHeader(salesCache[month].summary);

    renderSalesList(salesCache[month].list);

    return;
  }

  showSalesLoading();

  try {
    const res = await fetch(
      `${GAS_URL}?action=getSalesSummary&month=${encodeURIComponent(month)}`,
    );

    const response = await res.json();

    if (!response.success) {
      throw new Error(response.error);
    }

    updateSalesHeader(response.data.summary);
    renderSalesList(response.data.list);

    salesCache[month] = response.data;
  } catch (err) {
    showStatus(err.message, true);
  } finally {
    hideSalesLoading();
  }
}

function updateSalesHeader(data) {
  document.getElementById("salesTotal").innerText =
    "₹" + Number(data.totalSales).toLocaleString("en-IN");

  document.getElementById("salesCommission").innerText =
    "₹" + Number(data.totalCommission).toLocaleString("en-IN");

  document.getElementById("salesProfit").innerText =
    "₹" + Number(data.totalProfit).toLocaleString("en-IN");
}

function renderSalesList(rows) {
  const container = document.getElementById("salesList");

  container.innerHTML = "";

  rows.forEach((r) => {
    const card = document.createElement("div");

    card.className = "sales-card";

    card.innerHTML = `
<div class="product-top-row">
  <!-- Column 1 -->
  <div class="col-img">
    <img src="${r.thumbnailUrl}" onclick="showImagePreview('${r.thumbnailUrl}')" />
  </div>

  <!-- Column 2 -->
  <div class="col-info">
    <div class="sales-date">
      ${r.date}
    </div>

    <div class="sales-amount">
      ₹${Number(r.total).toLocaleString("en-IN")}
    </div>
  </div>

  <!-- Column 3 -->
  <div class="col-info">
    <div class="sales-date">
      ${r.quantity}
    </div>

    <div class="sales-amount">
      ₹${Number(r.profit).toLocaleString("en-IN")}
    </div>
  </div>

  <!-- Column 4 -->
  <div class="sales-team">
    ${r.soldBy}
  </div>
</div>

<div class="product-name">
  ${r.name}
</div>
    `;

    container.appendChild(card);
  });
}

function showSalesLoading() {
  document.getElementById("salesTotal").classList.add("skeleton");
  document.getElementById("salesCommission").classList.add("skeleton");
  document.getElementById("salesProfit").classList.add("skeleton");

  document.getElementById("salesTotal").innerText = "██████";
  document.getElementById("salesCommission").innerText = "██████";
  document.getElementById("salesProfit").innerText = "██████";

  document.getElementById("salesList").innerHTML = `
    <div class="expense-card skeleton-card"></div>
    <div class="expense-card skeleton-card"></div>
    <div class="expense-card skeleton-card"></div>
  `;
}

function hideSalesLoading() {
  document.getElementById("salesTotal").classList.remove("skeleton");

  document.getElementById("salesCommission").classList.remove("skeleton");

  document.getElementById("salesProfit").classList.remove("skeleton");
}

function getCurrentMonthName() {
  return new Date().toLocaleString("en-US", { month: "long" });
}

function renderCachedProducts() {
  const cached = localStorage.getItem("inventoryProducts");

  if (cached) {
    renderProducts(JSON.parse(cached));
    updateInventoryHeader(JSON.parse(cached));
    return;
  }

  // only if nothing exists
  refreshProducts();
}

let dashboardLoaded = false;

async function loadDashboard() {
  if (dashboardLoaded) return;

  setDashboardLoading(true);

  try {
    const res = await fetch(GAS_URL + "?action=getDashboardData");
    const data = await res.json();

    if (!data.success) {
      throw new Error(data.error || "Unable to fetch data");
    }

    setDashboardValues(data.data);
    dashboardLoaded = true;
    setDashboardLoading(false);
  } catch (err) {
    showStatus(err, true);
  }
}

function setDashboardLoading(isLoading) {
  const ids = ["totalSale", "salesIncome", "operationalExpense", "grossProfit"];

  ids.forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;

    if (isLoading) {
      el.classList.add("skeleton");
      el.textContent = "██████";
    } else {
      el.classList.remove("skeleton");
    }
  });
}

function showImagePreview(imageUrl) {
  document.getElementById("imagePreview").src = imageUrl;

  document.getElementById("imagePreviewOverlay").style.display = "flex";
}

function hideImagePreview() {
  document.getElementById("imagePreviewOverlay").style.display = "none";
}

function setDashboardValues(data) {
  setDashboardLoading(false);

  document.getElementById("totalSale").textContent =
    "₹" + Number(data.totalSale).toLocaleString("en-IN");

  document.getElementById("salesIncome").textContent =
    "₹" + Number(data.salesIncome).toLocaleString("en-IN");

  document.getElementById("operationalExpense").textContent =
    "₹" + Number(data.operationalExpense).toLocaleString("en-IN");

  document.getElementById("grossProfit").textContent =
    "₹" + Number(data.grossProfit).toLocaleString("en-IN");
}

function clearInventoryAddNewProductForm() {
  document.getElementById("inventory_add_new_product_name").value = "";
  document.getElementById("inventory_add_new_product_amount").value = "";
  document.getElementById(
    "inventory_add_new_product_manufacturing_cost",
  ).value = "300";
  document.getElementById("inventory_add_new_product_quantity").value = "1";
  document.getElementById("inventory_add_new_product_photo").value = "";
}

function showStatus(message, isError = false) {
  const status = document.getElementById("statusMessage");

  status.innerText = message;

  status.style.background = isError ? "#ffebee" : "#e8f5e9";

  status.style.color = isError ? "#c62828" : "#2e7d32";

  status.style.display = "block";

  setTimeout(() => {
    status.style.display = "none";
  }, 3000);
}
