const TOKEN = "8215096858:AAH9MBg84y5pwzeyxp2PkpYk6GmuLpZG6tY";
const CHAT_ID = "910810582";
const URL_API = `https://api.telegram.org/bot${TOKEN}/sendMessage`;

const PLACEHOLDER_IMG = "data:image/svg+xml;utf8," + encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600">
    <rect width="100%" height="100%" fill="#efefef"/>
    <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#999" font-family="Arial" font-size="28">No image</text>
  </svg>`
);

// Инициализация при загрузке страницы
document.addEventListener("DOMContentLoaded", function() {
  console.log("DOM loaded - initializing cart");
  
  // Инициализация корзины
  initCart();
  
  // Обработчики кнопок
  document.getElementById("orderBtn")?.addEventListener("click", onOrder);
  document.getElementById("backBtn")?.addEventListener("click", () => window.history.back());
  
  // Делегирование событий для кнопок добавления в корзину
  document.addEventListener("click", function(e) {
    // Добавление в корзину
    if (e.target.closest(".add-to-cart")) {
      e.preventDefault();
      const addBtn = e.target.closest(".add-to-cart");
      addToCart(addBtn);
      return;
    }
    
    // Удаление из корзины
    if (e.target.closest(".remove-btn")) {
      const removeBtn = e.target.closest(".remove-btn");
      const index = parseInt(removeBtn.getAttribute("data-index"));
      removeFromCart(index);
      return;
    }
    
    // Увеличение количества
    if (e.target.classList.contains("plus")) {
      const index = parseInt(e.target.getAttribute("data-index"));
      changeQuantity(index, 1);
      return;
    }
    
    // Уменьшение количества
    if (e.target.classList.contains("minus")) {
      const index = parseInt(e.target.getAttribute("data-index"));
      changeQuantity(index, -1);
      return;
    }
  });
  
  // Обработка изменения размеров
  document.addEventListener("change", function(e) {
    if (e.target.classList.contains("size-select")) {
      const select = e.target;
      const index = parseInt(select.getAttribute("data-index"));
      const subIndex = parseInt(select.getAttribute("data-subindex"));
      const size = select.value;
      
      updateSize(index, subIndex, size);
    }
  });
});

// Инициализация корзины
function initCart() {
  console.log("Initializing cart...");
  
  // Создаем корзину если её нет
  if (!localStorage.getItem("cart")) {
    localStorage.setItem("cart", "[]");
  }
  
  // Обновляем счетчик
  updateCartCount();
  
  // Рендерим корзину если на странице корзины
  if (document.getElementById("cart-items")) {
    renderCart();
  }
}

// Добавление товара в корзину
function addToCart(addBtn) {
  console.log("Adding to cart...");
  
  const productEl = addBtn.closest(".product");
  if (!productEl) {
    console.error("Product element not found");
    return;
  }
  
  // Получаем данные товара
  const name = getProductName(productEl);
  const price = getProductPrice(productEl);
  const image = getProductImage(productEl);
  
  console.log("Product data:", { name, price, image });
  
  // Добавляем в корзину
  const cart = getCart();
  cart.push({
    name: name,
    price: price,
    img: image,
    count: 1,
    sizes: [""]
  });
  
  saveCart(cart);
  updateCartCount();
  
  // Показываем уведомление
  showToast(`${name} добавлен в корзину`);
  
  // Если мы на странице корзины - перерисовываем
  if (document.getElementById("cart-items")) {
    renderCart();
  }
}

// Получение названия товара
function getProductName(productEl) {
  const nameEl = productEl.querySelector(".product-title");
  return nameEl ? nameEl.textContent.trim() : "Без названия";
}

// Получение цены товара
function getProductPrice(productEl) {
  const priceEl = productEl.querySelector(".product-price");
  return priceEl ? priceEl.textContent.trim() : "0 ₽";
}

// Получение изображения товара
function getProductImage(productEl) {
  console.log("Getting product image...");
  
  // Пробуем найти обычное изображение
  const imgEl = productEl.querySelector("img");
  if (imgEl) {
    const src = imgEl.src || imgEl.getAttribute("data-src");
    if (src && src !== "") {
      console.log("Found image in img tag:", src);
      return src;
    }
  }
  
  // Пробуем найти background-image
  const bgEl = productEl.querySelector(".product-img") || productEl;
  const bgImage = window.getComputedStyle(bgEl).backgroundImage;
  
  if (bgImage && bgImage !== "none") {
    const match = bgImage.match(/url\(["']?([^"']*)["']?\)/);
    if (match && match[1]) {
      console.log("Found image in background:", match[1]);
      return match[1];
    }
  }
  
  // Ищем в любом элементе с классом содержащим "img" или "image"
  const possibleImgContainers = productEl.querySelectorAll('[class*="img"], [class*="image"]');
  for (let container of possibleImgContainers) {
    const bg = window.getComputedStyle(container).backgroundImage;
    if (bg && bg !== "none") {
      const match = bg.match(/url\(["']?([^"']*)["']?\)/);
      if (match && match[1]) {
        console.log("Found image in container:", match[1]);
        return match[1];
      }
    }
  }
  
  console.log("No image found, using placeholder");
  return PLACEHOLDER_IMG;
}

// Рендер корзины в вашем стиле
function renderCart() {
  console.log("Rendering cart...");
  
  const cartItems = document.getElementById("cart-items");
  if (!cartItems) return;
  
  const cart = getCart();
  
  if (cart.length === 0) {
    cartItems.innerHTML = '<p style="color:#666;text-align:center">Корзина пуста</p>';
    updateTotal();
    return;
  }
  
  let html = "";
  
  cart.forEach((item, index) => {
    // Убеждаемся что sizes - массив правильной длины
    if (!Array.isArray(item.sizes)) {
      item.sizes = [""];
    }
    while (item.sizes.length < item.count) {
      item.sizes.push("");
    }
    if (item.sizes.length > item.count) {
      item.sizes = item.sizes.slice(0, item.count);
    }
    
    // Генерируем селекторы размеров
    let sizeSelectors = "";
    for (let i = 0; i < item.count; i++) {
      sizeSelectors += `
        <select class="size-select" data-index="${index}" data-subindex="${i}">
          <option value="">Выберите размер</option>
          <option value="M" ${item.sizes[i] === "M" ? "selected" : ""}>M</option>
          <option value="L" ${item.sizes[i] === "L" ? "selected" : ""}>L</option>
          <option value="XL" ${item.sizes[i] === "XL" ? "selected" : ""}>XL</option>
          <option value="XXL" ${item.sizes[i] === "XXL" ? "selected" : ""}>XXL</option>
          <option value="XXXL" ${item.sizes[i] === "XXXL" ? "selected" : ""}>XXXL</option>
        </select>
      `;
    }
    
    html += `
      <div class="cart-card">
        <img src="${item.img || PLACEHOLDER_IMG}" alt="${escapeHtml(item.name)}" onerror="this.src='${PLACEHOLDER_IMG}'">
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
      </div>
    `;
  });
  
  cartItems.innerHTML = html;
  updateTotal();
}

// Изменение количества товара
function changeQuantity(index, change) {
  const cart = getCart();
  
  if (cart[index]) {
    cart[index].count += change;
    
    // Не позволяем количеству быть меньше 1
    if (cart[index].count < 1) {
      cart[index].count = 1;
    }
    
    // Обновляем массив размеров
    if (!Array.isArray(cart[index].sizes)) {
      cart[index].sizes = [""];
    }
    
    if (change > 0) {
      // Добавляем пустой размер для нового элемента
      cart[index].sizes.push("");
    } else if (change < 0) {
      // Удаляем последний размер
      cart[index].sizes.pop();
    }
    
    saveCart(cart);
    renderCart();
    updateCartCount();
  }
}

// Обновление размера
function updateSize(index, subIndex, size) {
  const cart = getCart();
  
  if (cart[index] && cart[index].sizes[subIndex] !== undefined) {
    cart[index].sizes[subIndex] = size;
    saveCart(cart);
  }
}

// Удаление товара из корзины
function removeFromCart(index) {
  const cart = getCart();
  
  if (cart[index]) {
    cart.splice(index, 1);
    saveCart(cart);
    renderCart();
    updateCartCount();
  }
}

// Работа с localStorage
function getCart() {
  try {
    return JSON.parse(localStorage.getItem("cart")) || [];
  } catch (e) {
    console.error("Error reading cart:", e);
    return [];
  }
}

function saveCart(cart) {
  try {
    localStorage.setItem("cart", JSON.stringify(cart));
  } catch (e) {
    console.error("Error saving cart:", e);
  }
}

// Обновление общей суммы
function updateTotal() {
  const cart = getCart();
  let total = 0;
  
  cart.forEach(item => {
    const priceMatch = item.price.match(/(\d+[\s\d]*)/);
    if (priceMatch) {
      const priceNum = parseInt(priceMatch[0].replace(/\s/g, "")) || 0;
      total += priceNum * item.count;
    }
  });
  
  const totalElement = document.getElementById("totalPrice");
  if (totalElement) {
    totalElement.textContent = `Итого: ${total.toLocaleString()} ₽`;
  }
}

// Обновление счетчика корзины
function updateCartCount() {
  const cart = getCart();
  const totalCount = cart.reduce((total, item) => total + item.count, 0);
  
  const countElement = document.getElementById("cart-count");
  if (countElement) {
    countElement.textContent = totalCount;
  }
}

// Отправка заказа
function onOrder() {
  const cart = getCart();
  
  if (cart.length === 0) {
    alert("Корзина пуста!");
    return;
  }
  
  // Проверяем что все размеры выбраны
  for (let item of cart) {
    for (let size of item.sizes) {
      if (!size) {
        alert("Пожалуйста, выберите размер для всех товаров!");
        return;
      }
    }
  }
  
  // Формируем сообщение
  let message = "🛒 НОВЫЙ ЗАКАЗ\n\n";
  
  cart.forEach((item, index) => {
    message += `${index + 1}. ${item.name}\n`;
    message += `   Количество: ${item.count} шт.\n`;
    message += `   Размеры: ${item.sizes.join(", ")}\n`;
    message += `   Цена: ${item.price}\n\n`;
  });
  
  // Отправляем в Telegram
  fetch(URL_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      chat_id: CHAT_ID,
      text: message
    })
  })
  .then(response => {
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    return response.json();
  })
  .then(data => {
    if (data.ok) {
      alert("✅ Заказ успешно отправлен!");
      // Очищаем корзину
      localStorage.removeItem("cart");
      renderCart();
      updateCartCount();
    } else {
      throw new Error(data.description);
    }
  })
  .catch(error => {
    console.error("Error:", error);
    alert("❌ Ошибка при отправке заказа: " + error.message);
  });
}

// Вспомогательные функции
function showToast(message) {
  // Создаем или находим контейнер для тостов
  let toastContainer = document.getElementById("toast-container");
  if (!toastContainer) {
    toastContainer = document.createElement("div");
    toastContainer.id = "toast-container";
    toastContainer.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 10000;
    `;
    document.body.appendChild(toastContainer);
  }
  
  // Создаем тост
  const toast = document.createElement("div");
  toast.style.cssText = `
    background: #4CAF50;
    color: white;
    padding: 12px 20px;
    margin-bottom: 10px;
    border-radius: 4px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.2);
    animation: slideIn 0.3s ease;
  `;
  toast.textContent = message;
  
  toastContainer.appendChild(toast);
  
  // Удаляем тост через 3 секунды
  setTimeout(() => {
    toast.style.animation = "slideOut 0.3s ease";
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  }, 3000);
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// Добавляем стили для анимаций
if (!document.querySelector("#cart-styles")) {
  const style = document.createElement("style");
  style.id = "cart-styles";
  style.textContent = `
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
      from { transform: translateX(0); opacity: 1; }
      to { transform: translateX(100%); opacity: 0; }
    }
  `;
  document.head.appendChild(style);
}