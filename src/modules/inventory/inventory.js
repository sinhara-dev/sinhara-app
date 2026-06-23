import * as utils from "../../utils/utils.js";
import { MARKETING_TEAMS } from "../../config.js";
import { openActionModal, closeActionModal } from "../../utils/modal.js";
import { salesCache } from "../sales/sales.js";
import { dashboardCache } from "../dashboard/dashboard.js";
import { http } from "../../services/http.js";

let productsCache = [];

function hideImagePreview() {
  document.getElementById("imagePreviewOverlay").style.display = "none";
}

function showImagePreview(imageUrl) {
  document.getElementById("imagePreview").src = imageUrl;

  document.getElementById("imagePreviewOverlay").style.display = "flex";
}

function openSoldDialog(event, productId) {
  event.stopPropagation();

  const product = productsCache.find((p) => Number(p.id) === Number(productId));

  if (!product) {
    utils.ShowStatus("Product not found", true);
    return;
  }

  const container = document.createElement("div");

  // ---------- header ----------
  const header = document.createElement("div");
  header.style.display = "flex";
  header.style.gap = "1rem";
  header.style.marginBottom = "1rem";
  header.style.alignItems = "center";

  const img = document.createElement("img");
  img.src = product.thumbnailUrl;
  img.style.width = "4rem";
  img.style.height = "4rem";
  img.style.borderRadius = "0.5rem";
  img.style.objectFit = "cover";

  const info = document.createElement("div");

  const name = document.createElement("div");
  name.textContent = product.name;
  name.style.fontSize = "0.8rem";
  name.style.fontWeight = "bold";

  const price = document.createElement("div");
  price.textContent = `₹${utils.FormatAmount(product.amount)}`;
  price.style.marginTop = "0.2rem";
  price.style.marginBottom = "0.2rem";
  price.style.fontSize = "0.7rem";
  price.style.fontWeight = "bold";

  const stock = document.createElement("div");
  stock.textContent = `Current Stock: ${product.quantity}`;
  stock.style.fontSize = "0.7rem";

  info.appendChild(name);
  info.appendChild(price);
  info.appendChild(stock);

  header.appendChild(img);
  header.appendChild(info);

  // ---------- quantity ----------
  const qtyLabel = document.createElement("label");
  qtyLabel.textContent = "Quantity";

  const qtyInput = document.createElement("input");
  qtyInput.type = "number";
  qtyInput.min = "1";
  qtyInput.value = "1";
  qtyInput.id = "soldQuantity";

  // ---------- team ----------
  const teamLabel = document.createElement("label");
  teamLabel.textContent = "Marketing Team";

  const teamSelect = document.createElement("select");
  teamSelect.id = "soldMarketingTeam";

  Object.keys(MARKETING_TEAMS).forEach((team) => {
    const option = document.createElement("option");
    option.value = team;
    option.textContent = team;
    teamSelect.appendChild(option);
  });

  // ---------- other team fields ----------
  const otherContainer = document.createElement("div");
  otherContainer.style.display = "none";
  otherContainer.style.marginTop = "0.5rem";

  const otherNameLabel = document.createElement("label");
  otherNameLabel.textContent = "Marketing Team Name";

  const otherNameInput = document.createElement("input");
  otherNameInput.type = "text";
  otherNameInput.id = "soldOtherName";

  const percentageLabel = document.createElement("label");
  percentageLabel.textContent = "Percentage";

  const percentageWrapper = document.createElement("div");
  percentageWrapper.style.position = "relative";

  const percentageInput = document.createElement("input");
  percentageInput.id = "soldOtherPercentage";
  percentageInput.type = "number";
  percentageInput.style.paddingRight = "2rem";
  percentageInput.min = "0";
  percentageInput.max = "100";
  percentageInput.value = "40";

  const percentSign = document.createElement("span");
  percentSign.textContent = "%";
  percentSign.style.position = "absolute";
  percentSign.style.right = "0.75rem";
  percentSign.style.top = "50%";
  percentSign.style.transform = "translateY(-50%)";

  percentageWrapper.appendChild(percentageInput);
  percentageWrapper.appendChild(percentSign);

  otherContainer.appendChild(otherNameLabel);
  otherContainer.appendChild(otherNameInput);
  otherContainer.appendChild(percentageLabel);
  otherContainer.appendChild(percentageWrapper);

  teamSelect.addEventListener("change", () => {
    const isOther = teamSelect.value === "Other";

    otherContainer.style.display = isOther ? "block" : "none";

    if (!isOther) {
      otherNameInput.value = "";
      percentageInput.value = "40";
    }
  });

  // ---------- date ----------
  const dateLabel = document.createElement("label");
  dateLabel.textContent = "Sale Date";

  const dateInput = document.createElement("input");
  dateInput.type = "date";
  dateInput.value = new Date().toISOString().split("T")[0];
  dateInput.id = "soldDate";

  // ---------- submit ----------
  const btn = document.createElement("button");
  btn.style.marginTop = "1rem";
  btn.textContent = "SUBMIT";

  btn.addEventListener("click", () => {
    submitSale(product.id);
  });

  // ---------- assemble ----------
  container.appendChild(header);
  container.appendChild(dateLabel);
  container.appendChild(dateInput);
  container.appendChild(qtyLabel);
  container.appendChild(qtyInput);
  container.appendChild(teamLabel);
  container.appendChild(teamSelect);
  container.appendChild(otherContainer);
  container.appendChild(btn);

  openActionModal("Record Sale", container);
}

function openStockDialog(event, productId) {
  event.stopPropagation();

  const product = productsCache.find((p) => Number(p.id) === Number(productId));

  if (!product) {
    utils.ShowStatus("Product not found", true);
    return;
  }

  const container = document.createElement("div");

  // ---------- header ----------
  const header = document.createElement("div");
  header.style.display = "flex";
  header.style.gap = "1rem";
  header.style.marginBottom = "1rem";
  header.style.alignItems = "center";

  const img = document.createElement("img");
  img.src = product.thumbnailUrl;
  img.style.width = "4rem";
  img.style.height = "4rem";
  img.style.borderRadius = "0.5rem";
  img.style.objectFit = "cover";

  const info = document.createElement("div");

  const name = document.createElement("div");
  name.textContent = product.name;
  name.style.fontSize = "1rem";
  name.style.fontWeight = "bold";

  const price = document.createElement("div");
  price.textContent = `₹${utils.FormatAmount(product.amount)}`;

  const stock = document.createElement("div");
  stock.textContent = `Current Stock: ${product.quantity}`;

  info.appendChild(name);
  info.appendChild(price);
  info.appendChild(stock);

  header.appendChild(img);
  header.appendChild(info);

  // ---------- quantity ----------
  const qtyLabel = document.createElement("label");
  qtyLabel.textContent = "Quantity To Add";

  const qtyInput = document.createElement("input");
  qtyInput.type = "number";
  qtyInput.min = "1";
  qtyInput.value = "1";
  qtyInput.id = "stockQuantity";

  // ---------- submit ----------
  const btn = document.createElement("button");
  btn.style.marginTop = "1rem";
  btn.textContent = "SUBMIT";

  btn.addEventListener("click", () => {
    submitStockUpdate(product.id);
  });

  // ---------- assemble ----------
  container.appendChild(header);
  container.appendChild(qtyLabel);
  container.appendChild(qtyInput);
  container.appendChild(btn);

  openActionModal("Update Stock", container);
}

async function submitSale(productId) {
  const quantity = Number(document.getElementById("soldQuantity").value);

  // eslint-disable-next-line no-useless-assignment
  let marketingTeam = "";
  const team = document.getElementById("soldMarketingTeam").value;

  if (team === "Other") {
    marketingTeam = document.getElementById("soldOtherName").value;
    if (marketingTeam === "") {
      utils.ShowStatus("Marketing team name is required", true);
      return;
    }
  } else {
    marketingTeam = team;
  }

  const commission =
    team === "Other"
      ? Number(document.getElementById("soldOtherPercentage").value) / 100
      : Number(MARKETING_TEAMS[team]) / 100;

  const date = document.getElementById("soldDate").value;

  closeActionModal();

  const loader = document.getElementById(`loader_${productId}`);

  loader.style.display = "flex";

  try {
    const res = await http.Post("sales", {
      productId,
      quantity,
      marketingTeam: marketingTeam,
      commission,
      saleDate: date,
    });

    const response = await res.json();

    if (response.code !== 200) {
      throw new Error(response.error || "Failed to record sale");
    }

    await refreshProducts();

    const month = utils.GetMonthNameFromDate(date);
    const cacheKey = `${new Date(date).getFullYear()}-${month}`;
    delete salesCache[cacheKey];
    delete dashboardCache[cacheKey];

    utils.ShowStatus("Sale recorded");
  } catch (error) {
    console.error(error);
    utils.ShowStatus(error.message, true);
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
    const res = await http.Post("stock", {
      productId,
      quantityToAdd: quantity,
    });

    const response = await res.json();

    if (response.code !== 200) {
      throw new Error(response.error || "Failed to update stock");
    }

    await refreshProducts();

    utils.ShowStatus("Stock updated");
  } catch (error) {
    console.error(error);
    utils.ShowStatus(error.message, true);
  } finally {
    loader.style.display = "none";
  }
}

function showStatusMessage(message) {
  const statusDiv = document.getElementById("inventory-status-message");

  if (!statusDiv) return;

  statusDiv.innerText = message;
}

function hideStatusMessage() {
  const statusDiv = document.getElementById("inventory-status-message");

  if (!statusDiv) return;

  statusDiv.innerText = "";
}

function renderProducts(products) {
  const gallery = document.getElementById("inventory_product_gallery");

  if (!gallery) {
    return;
  }

  gallery.innerHTML = "";

  products.forEach((product) => {
    const card = document.createElement("div");
    card.className = "product-card";

    // ---------- loader ----------
    const loader = document.createElement("div");
    loader.className = "card-loader";
    loader.id = `loader_${product.id}`;
    loader.style.display = "none";
    loader.textContent = "Updating...";

    // ---------- top row ----------
    const topRow = document.createElement("div");
    topRow.className = "product-top-row";

    // ---------- image ----------
    const colImg = document.createElement("div");
    colImg.className = "col-img";

    const img = document.createElement("img");
    img.src = product.thumbnailUrl;

    img.addEventListener("click", () => {
      showImagePreview(product.thumbnailUrl);
    });

    colImg.appendChild(img);

    // ---------- info ----------
    const colInfo = document.createElement("div");
    colInfo.className = "col-info";

    const amount = document.createElement("div");
    amount.className = "amount";
    amount.textContent = `₹${utils.FormatAmount(product.amount)}`;

    const stock = document.createElement("div");
    stock.className = "stock";
    stock.id = `stock_${product.id}`;
    stock.textContent = `Stock: ${product.quantity}`;

    const id = document.createElement("div");
    id.className = "product-id";
    id.textContent = `#${product.id}`;

    colInfo.appendChild(amount);
    colInfo.appendChild(stock);
    colInfo.appendChild(id);

    // ---------- actions ----------
    const colActions = document.createElement("div");
    colActions.className = "col-actions";

    const soldBtn = document.createElement("button");
    soldBtn.className = "sold-btn";
    soldBtn.textContent = "SOLD";

    soldBtn.addEventListener("click", (event) => {
      openSoldDialog(event, product.id);
    });

    const updateBtn = document.createElement("button");
    updateBtn.className = "update-btn";
    updateBtn.textContent = "ADD STOCK";

    updateBtn.addEventListener("click", (event) => {
      openStockDialog(event, product.id);
    });

    colActions.appendChild(soldBtn);
    colActions.appendChild(updateBtn);

    // ---------- assemble top row ----------
    topRow.appendChild(colImg);
    topRow.appendChild(colInfo);
    // topRow.appendChild(colId);
    topRow.appendChild(colActions);

    // ---------- product name ----------
    const name = document.createElement("div");
    name.className = "product-name";
    name.textContent = product.name;

    // ---------- assemble card ----------
    card.appendChild(loader);
    card.appendChild(topRow);
    card.appendChild(name);

    gallery.appendChild(card);
  });
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

function setSyncing(isSyncing) {
  const btn = document.getElementById("syncBtn");

  if (!btn) return;

  btn.classList.toggle("syncing", isSyncing);
}

async function refreshProducts() {
  setSyncing(true);

  try {
    const res = await http.Get("products");

    const response = await res.json();

    if (response.code !== 200) {
      throw new Error(response.error || "Failed to load inventory products");
    }

    const products = response.data;

    localStorage.setItem("inventoryProducts", JSON.stringify(products));

    productsCache = products;

    renderProducts(products);
    updateInventoryHeader(products);
  } catch (error) {
    console.error(error);
    utils.ShowStatus(error.message, true);
  } finally {
    setSyncing(false);
  }
}

function renderCachedProducts() {
  const cached = localStorage.getItem("inventoryProducts");

  if (cached) {
    const products = JSON.parse(cached);
    renderProducts(products);
    updateInventoryHeader(products);
    productsCache = products;
    return;
  }

  refreshProducts();
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

function showAddNewProductForm() {
  clearInventoryAddNewProductForm();

  document.body.classList.add("modal-open");
  document.getElementById("inventory_add_new_product").style.display = "block";

  const fab = document.getElementById("inventory_add_new_product_fab");
  if (fab) fab.style.display = "none";
}

function hideAddNewProductForm() {
  document.body.classList.remove("modal-open");
  document.getElementById("inventory_add_new_product").style.display = "none";

  const fab = document.getElementById("inventory_add_new_product_fab");
  if (fab) fab.style.display = "flex";
}

async function updateInventoryAddNewProduct() {
  const submitButton = document.getElementById(
    "inventory_add_new_product_btn_submit",
  );

  const productName = document.getElementById(
    "inventory_add_new_product_name",
  ).value;

  if (!productName.trim()) {
    utils.ShowStatus("Product name is required", true);
    return;
  }

  const amount = Number(
    document.getElementById("inventory_add_new_product_amount").value,
  );

  if (amount <= 0) {
    utils.ShowStatus("Amount is required", true);
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
    utils.ShowStatus("Please select a product photo", true);
    return;
  }

  submitButton.disabled = true;
  hideAddNewProductForm();
  showStatusMessage("Creating new product...");

  try {
    const base64 = await new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        resolve(e.target.result.split(",")[1]);
      };

      reader.onerror = reject;

      reader.readAsDataURL(file);
    });

    const res = await http.Post("product", {
      productName,
      amount,
      expense,
      quantity,
      base64Data: base64,
      mimeType: file.type,
    });

    const response = await res.json();

    if (response.code !== 200) {
      throw new Error(response.error || "Failed to create product");
    }

    await refreshProducts();

    utils.ShowStatus("Product created.\nID: " + response.data.productId);
  } catch (error) {
    console.error(error);
    utils.ShowStatus(error.message, true);
  } finally {
    hideStatusMessage();

    submitButton.disabled = false;
  }
}

function onInventorySearch(event) {
  const searchText = event.target.value.toLowerCase();

  const filteredItems = productsCache.filter((product) => {
    return (
      String(product.name).toLowerCase().includes(searchText) ||
      String(product.id).includes(searchText)
    );
  });

  renderProducts(filteredItems);
}

export function initInventory() {
  document.getElementById("syncBtn").addEventListener("click", refreshProducts);
  document
    .getElementById("inventory_add_new_product_fab")
    .addEventListener("click", showAddNewProductForm);

  document
    .getElementById("inventory_add_new_product_btn_close")
    .addEventListener("click", hideAddNewProductForm);

  document
    .getElementById("inventory_add_new_product_btn_submit")
    .addEventListener("click", updateInventoryAddNewProduct);

  document
    .getElementById("imagePreviewOverlay")
    .addEventListener("click", hideImagePreview);

  document
    .getElementById("actionModalCloseBtn")
    .addEventListener("click", closeActionModal);

  document
    .getElementById("inventorySearch")
    .addEventListener("input", onInventorySearch);
}

export const inventory = {
  onEnter: () => {
    renderCachedProducts();
  },
};
