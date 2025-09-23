const TOKEN = "8215096858:AAH9MBg84y5pwzeyxp2PkpYk6GmuLpZG6tY";
const CHAT_ID = "910810582";
const URL_API = `https://api.telegram.org/bot${TOKEN}/sendMessage`;

document.addEventListener("DOMContentLoaded", () => {
  renderCart();
  updateTotal();

  // --- Кнопка "Заказать"
  document.getElementById("orderBtn").addEventListener("click", () => {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    if (!cart.length) return alert("Корзина пуста!");

    for (let item of cart) {
      if (!item.size) return alert("Выберите размер для всех товаров!");
    }

    let message = "🛒 Новый заказ:\n\n";
    cart.forEach((item, i) => {
      message += `${i + 1}) ${item.name} — ${item.count} шт. (${item.size}) ${item.price}\n`;
    });

    fetch(URL_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: CHAT_ID, text: message }),
    })
    .then(() => {
      alert("✅ Заказ отправлен в Telegram");
      localStorage.removeItem("cart");
      renderCart();
      updateTotal();
    })
    .catch(() => alert("❌ Ошибка отправки заказа"));
  });

  // --- Кнопка очистки корзины
  document.getElementById("clearBtn").addEventListener("click", () => {
    localStorage.removeItem("cart");
    renderCart();
    updateTotal();
  });

  // --- Кнопка назад
  document.getElementById("backBtn").addEventListener("click", () => {
    window.history.back();
  });
});

// --- Рендер корзины ---
function renderCart() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const cartItems = document.getElementById("cart-items");
  cartItems.innerHTML = "";

  if (!cart.length) {
    cartItems.innerHTML = "<p>Корзина пуста</p>";
    return;
  }

  cart.forEach((item, index) => {
    const div = document.createElement("div");
    div.className = "cart-card";
    div.innerHTML = `
      <img src="${item.img}" alt="${item.name}">
      <div class="product-title">${item.name}</div>
      <div class="product-price">${item.price}</div>
      <label>Размер:
        <select class="size-select" data-index="${index}">
          <option value="">Выберите размер</option>
          <option value="M">M</option>
          <option value="L">L</option>
          <option value="XL">XL</option>
          <option value="XXL">XXL</option>
          <option value="XXXL">XXXL</option>
        </select>
      </label>
      <div class="quantity-controls">
        <button class="minus" data-index="${index}">-</button>
        <span>${item.count}</span>
        <button class="plus" data-index="${index}">+</button>
      </div>
    `;
    cartItems.appendChild(div);
  });

  // --- Кнопки +/-
  document.querySelectorAll(".plus").forEach(btn => {
    btn.onclick = () => {
      const i = btn.dataset.index;
      const cart = JSON.parse(localStorage.getItem("cart")) || [];
      cart[i].count++;
      localStorage.setItem("cart", JSON.stringify(cart));
      renderCart();
      updateTotal();
    };
  });

  document.querySelectorAll(".minus").forEach(btn => {
    btn.onclick = () => {
      const i = btn.dataset.index;
      const cart = JSON.parse(localStorage.getItem("cart")) || [];
      if (cart[i].count > 1) cart[i].count--;
      localStorage.setItem("cart", JSON.stringify(cart));
      renderCart();
      updateTotal();
    };
  });

  // --- Выбор размера
  document.querySelectorAll(".size-select").forEach(sel => {
    sel.onchange = () => {
      const i = sel.dataset.index;
      const cart = JSON.parse(localStorage.getItem("cart")) || [];
      cart[i].size = sel.value;
      localStorage.setItem("cart", JSON.stringify(cart));
    };
  });
}

// --- Подсчет общей суммы ---
function updateTotal() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const total = cart.reduce((sum, item) => {
    const priceNum = parseInt(item.price.replace(/\s/g, "").replace("₽",""));
    return sum + priceNum * item.count;
  }, 0);
  document.getElementById("totalPrice").innerText = `Итого: ${total.toLocaleString()} ₽`;
}
