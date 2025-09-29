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

// Инициализация при загрузке страницы
document.addEventListener("DOMContentLoaded", function () {
  console.log("DOM loaded - initializing cart");

  // Инициализация корзины
  initCart();

  // Обработчики кнопок
  document.getElementById("orderBtn")?.addEventListener("click", onOrder);
  document
    .getElementById("backBtn")
    ?.addEventListener("click", () => window.history.back());

  // Делегирование событий для кнопок
  document.addEventListener("click", function (e) {
    if (e.target.closest(".add-to-cart")) {
      e.preventDefault();
      const addBtn = e.target.closest(".add-to-cart");
      addToCart(addBtn);
      return;
    }
    if (e.target.closest(".remove-btn")) {
      const index = parseInt(
        e.target.closest(".remove-btn").getAttribute("data-index")
      );
      removeFromCart(index);
      return;
    }
    if (e.target.classList.contains("plus")) {
      const index = parseInt(e.target.getAttribute("data-index"));
      changeQuantity(index, 1);
      return;
    }
    if (e.target.classList.contains("minus")) {
      const index = parseInt(e.target.getAttribute("data-index"));
      changeQuantity(index, -1);
      return;
    }
  });

  // Обработка изменения размеров
  document.addEventListener("change", function (e) {
    if (e.target.classList.contains("size-select")) {
      const index = parseInt(e.target.getAttribute("data-index"));
      const subIndex = parseInt(e.target.getAttribute("data-subindex"));
      updateSize(index, subIndex, e.target.value);
    }
  });
});

// Инициализация корзины
function initCart() {
  if (!localStorage.getItem("cart")) {
    localStorage.setItem("cart", "[]");
  }
  updateCartCount();
  if (document.getElementById("cart-items")) {
    renderCart();
  }
}

// Добавление товара в корзину
function addToCart(addBtn) {
  const productEl = addBtn.closest(".product");
  if (!productEl) return;

  const name = getProductName(productEl);
  const price = getProductPrice(productEl);
  const image = getProductImage(productEl);

  const cart = getCart();
  cart.push({ name, price, img: image, count: 1, sizes: [""] });
  saveCart(cart);
  updateCartCount();
  showToast(`${name} добавлен в корзину`);

  if (document.getElementById("cart-items")) {
    renderCart();
  }
}

// Получение данных товара
function getProductName(productEl) {
  return (
    productEl.querySelector(".product-title")?.textContent.trim() ||
    "Без названия"
  );
}
function getProductPrice(productEl) {
  return productEl.querySelector(".product-price")?.textContent.trim() || "0 ₽";
}
function getProductImage(productEl) {
  const imgEl = productEl.querySelector("img");
  if (imgEl?.src) return imgEl.src;

  const bgEl = productEl.querySelector(".product-img") || productEl;
  const bgImage = window.getComputedStyle(bgEl).backgroundImage;
  const match = bgImage.match(/url\(["']?([^"']*)["']?\)/);
  if (match) return match[1];

  return PLACEHOLDER_IMG;
}

// Рендер корзины
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

// Изменение количества
function changeQuantity(index, change) {
  const cart = getCart();
  if (!cart[index]) return;

  cart[index].count += change;
  if (cart[index].count < 1) cart[index].count = 1;

  if (change > 0) cart[index].sizes.push("");
  else if (change < 0) cart[index].sizes.pop();

  saveCart(cart);
  renderCart();
  updateCartCount();
}

// Обновление размера
function updateSize(index, subIndex, size) {
  const cart = getCart();
  if (cart[index]) {
    cart[index].sizes[subIndex] = size;
    saveCart(cart);
  }
}

// Удаление товара
function removeFromCart(index) {
  const cart = getCart();
  cart.splice(index, 1);
  saveCart(cart);
  renderCart();
  updateCartCount();
}

// Работа с localStorage
function getCart() {
  return JSON.parse(localStorage.getItem("cart")) || [];
}
function saveCart(cart) {
  localStorage.setItem("cart", JSON.stringify(cart));
}

// Итоговая сумма
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
  if (totalElement) {
    totalElement.textContent = `Итого: ${total.toLocaleString()} ₽`;
  }
}

// Счетчик корзины
function updateCartCount() {
  const cart = getCart();
  const totalCount = cart.reduce((t, i) => t + i.count, 0);
  const countElement = document.getElementById("cart-count");
  if (countElement) countElement.textContent = totalCount;
}

// Отправка заказа
function onOrder() {
  const cart = getCart();
  if (!cart.length) return alert("Корзина пуста!");

  let profile = JSON.parse(localStorage.getItem("userProfile")) || null;
  if (!profile || !profile.firstName || !profile.phone) {
    alert("❗ Сначала заполните профиль (иконка пользователя справа вверху)");
    return;
  }

  const location = JSON.parse(localStorage.getItem("userLocation"));

  // Формируем сообщение
  let message = "🛒 НОВЫЙ ЗАКАЗ\n\n";
  cart.forEach((item, i) => {
    message += `${i + 1}) ${item.name}\n`;
    message += `   Количество: ${item.count}\n`;
    message += `   Размеры: ${item.sizes ? item.sizes.join(", ") : "-"}\n`;
    message += `   Цена: ${item.price}\n\n`;
  });

  message += `👤 Клиент:\n`;
  message += `Имя: ${profile.firstName} ${profile.lastName || ""}\n`;
  message += `Телефон: ${profile.phone}\n`;

  if (location) {
    message += `Адрес: 📍 Локация (см. карту)\n`;
  } else {
    message += `Адрес: ${profile.address || "—"}\n`;
  }

  message += `Telegram: ${profile.telegram || "—"}\n`;
  message += `Доп. инфо: ${profile.extra || "—"}\n`;

  // Отправка в телеграм
  fetch(URL_API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: CHAT_ID, text: message }),
  });

  // Если есть геолокация → отправляем отдельным сообщением
  if (location) {
    fetch(`https://api.telegram.org/bot${TOKEN}/sendLocation`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        latitude: location.lat,
        longitude: location.lon,
      }),
    });
  }

  alert("✅ Заказ отправлен!");
  localStorage.setItem("cart", JSON.stringify([])); // очищаем
  renderCart();
  updateCartCount(); // обновляем счётчик
}

// Вспомогательные
function showToast(message) {
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    container.style.cssText = `position:fixed;top:20px;right:20px;z-index:10000;`;
    document.body.appendChild(container);
  }
  const toast = document.createElement("div");
  toast.style.cssText = `background:#4CAF50;color:white;padding:12px 20px;margin-bottom:10px;border-radius:4px;box-shadow:0 2px 10px rgba(0,0,0,0.2);animation:slideIn 0.3s ease;`;
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

// Анимации
if (!document.querySelector("#cart-styles")) {
  const style = document.createElement("style");
  style.id = "cart-styles";
  style.textContent = `
    @keyframes slideIn { from { transform:translateX(100%);opacity:0;} to { transform:translateX(0);opacity:1;} }
    @keyframes slideOut { from { transform:translateX(0);opacity:1;} to { transform:translateX(100%);opacity:0;} }
  `;
  document.head.appendChild(style);
}
