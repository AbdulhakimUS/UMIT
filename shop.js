const TOKEN = "8215096858:AAH9MBg84y5pwzeyxp2PkpYk6GmuLpZG6tY";
const CHAT_ID = "910810582";
const URL_API = `https://api.telegram.org/bot${TOKEN}/sendMessage`;

const PLACEHOLDER_IMG =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600">
      <rect width="100%" height="100%" fill="#efefef"/>
      <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#999" font-family="Arial" font-size="28">No image</text>
    </svg>`
  );

// ------------------- Инициализация -------------------
document.addEventListener("DOMContentLoaded", function () {
  initCart();

  // Кнопки
  document.getElementById("orderBtn")?.addEventListener("click", onOrder);
  document.getElementById("backBtn")?.addEventListener("click", (e) => {
    e.preventDefault();
    window.history.back();
  });

  // Делегирование событий
  document.addEventListener("click", function (e) {
    if (e.target.closest(".add-to-cart")) {
      addToCart(e.target.closest(".add-to-cart"));
    }
    if (e.target.closest(".remove-btn")) {
      const index = parseInt(
        e.target.closest(".remove-btn").getAttribute("data-index")
      );
      removeFromCart(index);
    }
    if (e.target.classList.contains("plus")) {
      const index = parseInt(e.target.getAttribute("data-index"));
      changeQuantity(index, 1);
    }
    if (e.target.classList.contains("minus")) {
      const index = parseInt(e.target.getAttribute("data-index"));
      changeQuantity(index, -1);
    }
  });

  // Изменение размера
  document.addEventListener("change", function (e) {
    if (e.target.classList.contains("size-select")) {
      const index = parseInt(e.target.getAttribute("data-index"));
      const subIndex = parseInt(e.target.getAttribute("data-subindex"));
      updateSize(index, subIndex, e.target.value);
    }
  });

  // Инициализация телефона
  initPhoneInput();

  updateCartCount();
});

// ------------------- Корзина -------------------
function initCart() {
  if (!localStorage.getItem("cart")) {
    localStorage.setItem("cart", "[]");
  }
  updateCartCount();
  if (document.getElementById("cart-items")) {
    renderCart();
  }
}

function getCart() {
  return JSON.parse(localStorage.getItem("cart")) || [];
}

function saveCart(cart) {
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartCount();
}

function addToCart(addBtn) {
  const productEl = addBtn.closest(".product");
  if (!productEl) return;

  const name = getProductName(productEl);
  const price = getProductPrice(productEl);
  const image = getProductImage(productEl);

  const cart = getCart();
  const existingItem = cart.find((i) => i.name === name);

  if (existingItem) {
    existingItem.count++;
    existingItem.sizes.push("");
  } else {
    cart.push({ name, price, img: image, count: 1, sizes: [""] });
  }

  saveCart(cart);
  renderCart();
  showToast(`${name} добавлен в корзину`);
}

function removeFromCart(index) {
  const cart = getCart();
  cart.splice(index, 1);
  saveCart(cart);
  renderCart();
}

function changeQuantity(index, change) {
  const cart = getCart();
  if (!cart[index]) return;

  cart[index].count += change;
  if (cart[index].count < 1) cart[index].count = 1;

  if (change > 0) cart[index].sizes.push("");
  else if (change < 0) cart[index].sizes.pop();

  saveCart(cart);
  renderCart();
}

function updateSize(index, subIndex, size) {
  const cart = getCart();
  if (cart[index]) {
    cart[index].sizes[subIndex] = size;
    saveCart(cart);
  }
}

// ------------------- Рендер -------------------
function renderCart() {
  const cartItems = document.getElementById("cart-items");
  if (!cartItems) return;

  const cart = getCart();
  if (cart.length === 0) {
    cartItems.innerHTML =
      '<p style="color:#666;text-align:center">Корзина пуста</p>';
    updateTotal();
    return;
  }

  let html = "";
  cart.forEach((item, index) => {
    while (item.sizes.length < item.count) item.sizes.push("");
    if (item.sizes.length > item.count)
      item.sizes = item.sizes.slice(0, item.count);

    let sizeSelectors = "";
    for (let i = 0; i < item.count; i++) {
      sizeSelectors += `
        <select class="size-select" data-index="${index}" data-subindex="${i}">
          <option value="">Выберите размер</option>
          <option value="M" ${
            item.sizes[i] === "M" ? "selected" : ""
          }>M</option>
          <option value="L" ${
            item.sizes[i] === "L" ? "selected" : ""
          }>L</option>
          <option value="XL" ${
            item.sizes[i] === "XL" ? "selected" : ""
          }>XL</option>
          <option value="XXL" ${
            item.sizes[i] === "XXL" ? "selected" : ""
          }>XXL</option>
          <option value="XXXL" ${
            item.sizes[i] === "XXXL" ? "selected" : ""
          }>XXXL</option>
        </select>`;
    }

    html += `
      <div class="cart-card">
        <img src="${item.img || PLACEHOLDER_IMG}" alt="${escapeHtml(
      item.name
    )}" onerror="this.src='${PLACEHOLDER_IMG}'">
        <div class="product-title">${escapeHtml(item.name)}</div>
        <div class="product-price">${escapeHtml(item.price)}</div>
        ${sizeSelectors}
        <div class="quantity-controls">
          <button class="minus" data-index="${index}">−</button>
          <span class="qty">${item.count}</span>
          <button class="plus" data-index="${index}">+</button>
        </div>
        <button class="remove-btn" data-index="${index}" title="Удалить товар">
          <i class="fa-solid fa-trash"></i>
        </button>
      </div>`;
  });

  cartItems.innerHTML = html;
  updateTotal();
}

function updateTotal() {
  const cart = getCart();
  let total = 0;
  cart.forEach((item) => {
    const priceMatch = item.price.match(/(\d+[\s\d]*)/);
    if (priceMatch) {
      total += parseInt(priceMatch[0].replace(/\s/g, "")) * item.count;
    }
  });
  const totalElement = document.getElementById("totalPrice");
  if (totalElement)
    totalElement.textContent = `Итого: ${total.toLocaleString()} ₽`;
}

function updateCartCount() {
  const cart = getCart();
  const totalCount = cart.reduce((t, i) => t + i.count, 0);
  const countElement = document.getElementById("cart-count");
  if (countElement) countElement.textContent = totalCount;
}

// ------------------- Telegram с retry -------------------
async function sendTelegramWithRetry(text, maxRetries = 3) {
  let token = TOKEN;
  let chatId = CHAT_ID;

  // Пробуем получить из Supabase
  try {
    if (typeof supabase !== "undefined") {
      const { data: settings } = await supabase
        .from("site_content")
        .select("section_key, content_value")
        .in("section_key", ["telegram_token", "telegram_chat_id"]);

      if (settings) {
        const t = settings.find((s) => s.section_key === "telegram_token");
        const c = settings.find((s) => s.section_key === "telegram_chat_id");
        if (t?.content_value) token = t.content_value;
        if (c?.content_value) chatId = c.content_value;
      }
    }
  } catch (e) {
    console.warn("Could not fetch Telegram settings from Supabase:", e);
  }

  const url = `https://api.telegram.org/bot${token}/sendMessage`;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: text,
          parse_mode: "HTML",
        }),
      });

      if (response.ok) return true;

      console.warn(
        `Telegram attempt ${attempt} failed:`,
        await response.text()
      );
    } catch (error) {
      console.warn(`Telegram attempt ${attempt} error:`, error);
    }

    if (attempt < maxRetries) {
      await new Promise((r) => setTimeout(r, 1000 * attempt));
    }
  }
  return false;
}

// ------------------- Заказ -------------------
async function onOrder() {
  const cart = getCart();
  if (!cart.length) return alert("Корзина пуста!");

  const profile = JSON.parse(localStorage.getItem("userProfile")) || null;
  if (!profile || !profile.firstName || !profile.phone) {
    alert("❗ Заполните профиль");
    return;
  }

  // Расчет суммы
  let totalSum = 0;
  cart.forEach((item) => {
    const priceMatch = item.price.match(/(\d+[\s\d]*)/);
    const price = priceMatch ? parseInt(priceMatch[0].replace(/\s/g, "")) : 0;
    totalSum += price * item.count;
  });

  // Сохранение в Supabase
  try {
    if (typeof supabase !== "undefined") {
      const { error } = await supabase.from("orders").insert({
        customer_name: `${profile.firstName} ${profile.lastName || ""}`.trim(),
        customer_phone: profile.phone,
        customer_address: profile.address || "",
        customer_telegram: profile.telegram || "",
        items: cart,
        total: totalSum,
      });

      if (error) {
        console.error("Supabase error:", error);
      }
    }
  } catch (e) {
    console.error("Save order error:", e);
  }

  // Формируем сообщение для Telegram
  let itemsList = cart
    .map((item) => {
      const sizes = item.sizes?.filter((s) => s).join(", ") || "не указан";
      return `• ${item.name} × ${item.count} (размер: ${sizes}) — ${item.price}`;
    })
    .join("\n");

  const text =
    `🛒 <b>НОВЫЙ ЗАКАЗ</b>\n\n` +
    `👤 <b>Клиент:</b> ${profile.firstName} ${profile.lastName || ""}\n` +
    `📱 <b>Телефон:</b> ${profile.phone}\n` +
    `📍 <b>Адрес:</b> ${profile.address || "не указан"}\n` +
    `💬 <b>Telegram:</b> ${profile.telegram || "не указан"}\n\n` +
    `📦 <b>Товары:</b>\n${itemsList}\n\n` +
    `💰 <b>ИТОГО: ${totalSum.toLocaleString()} ₽</b>`;

  // Отправка в Telegram с retry
  const sent = await sendTelegramWithRetry(text);

  if (!sent) {
    console.error("Telegram notification failed after retries");
  }

  alert("✅ Заказ отправлен!");
  localStorage.setItem("cart", "[]");
  renderCart();
  updateCartCount();
}

// ------------------- Вспомогательные -------------------
function showToast(message) {
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    container.style.cssText = `position:fixed;top:20px;right:20px;z-index:10000;`;
    document.body.appendChild(container);
  }
  const toast = document.createElement("div");
  toast.style.cssText =
    "background:#4CAF50;color:white;padding:12px 20px;margin-bottom:10px;border-radius:4px;box-shadow:0 2px 10px rgba(0,0,0,0.2);animation:slideIn 0.3s ease;";
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.animation = "slideOut 0.3s ease";
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// ------------------- Телефон с префиксом -------------------
function initPhoneInput() {
  const input = document.getElementById("phone");
  if (!input) return;

  const prefix = "+998";

  input.addEventListener("focus", () => {
    if (!input.value) {
      input.value = prefix;
      setTimeout(
        () => input.setSelectionRange(prefix.length, prefix.length),
        0
      );
    }
  });

  input.addEventListener("keydown", (e) => {
    const selStart = input.selectionStart;
    if (
      (e.key === "Backspace" || e.key === "Delete") &&
      selStart <= prefix.length
    ) {
      e.preventDefault();
      input.setSelectionRange(prefix.length, prefix.length);
    }
  });

  input.addEventListener("input", () => {
    if (!input.value.startsWith(prefix)) {
      input.value = prefix + input.value.replace(/\D/g, "");
    } else {
      input.value =
        prefix + input.value.slice(prefix.length).replace(/\D/g, "");
    }
  });

  input.addEventListener("blur", () => {
    if (input.value === prefix) input.value = "";
  });
}

// ------------------- Получение данных товара -------------------
function getProductName(productEl) {
  const titleEl = productEl.querySelector(".product-title");
  return titleEl ? titleEl.textContent.trim() : "Товар";
}

function getProductPrice(productEl) {
  const priceEl = productEl.querySelector(".product-price");
  return priceEl ? priceEl.textContent.trim() : "0 ₽";
}

function getProductImage(productEl) {
  const imgEl =
    productEl.querySelector(".product-img img") ||
    productEl.querySelector("img");
  return imgEl ? imgEl.src : PLACEHOLDER_IMG;
}
