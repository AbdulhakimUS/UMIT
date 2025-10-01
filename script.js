// ------------------- Navbar scroll -------------------
const navbar = document.querySelector(".navbar");
window.addEventListener("scroll", () => {
  if (window.scrollY > 50) {
    navbar.classList.add("scrolled");
  } else {
    navbar.classList.remove("scrolled");
  }
});

// ------------------- Прелоадер -------------------
window.addEventListener("load", () => {
  const preloader = document.getElementById("preloader");
  if (preloader) {
    setTimeout(() => preloader.classList.add("hidden"), 500);
  }
  window.scrollTo({ top: 0, behavior: "auto" });
});

// ------------------- Показ/скрытие товаров -------------------
document.addEventListener("DOMContentLoaded", () => {
  const products = Array.from(document.querySelectorAll(".product"));
  const showMoreBtn = document.getElementById("showMoreBtn");
  const closeBtn = document.getElementById("closeBtn");

  let visibleCount = 4;

  function updateProducts() {
    products.forEach((p, i) => p.classList.toggle("show", i < visibleCount));

    if (showMoreBtn) {
      showMoreBtn.style.display =
        visibleCount >= products.length ? "none" : "inline-block";
    }
    if (closeBtn) {
      closeBtn.style.display = visibleCount > 4 ? "inline-block" : "none";
    }
  }

  showMoreBtn?.addEventListener("click", () => {
    visibleCount = Math.min(visibleCount + 4, products.length);
    updateProducts();
    const lastVisible =
      products[Math.min(visibleCount - 1, products.length - 1)];
    lastVisible?.scrollIntoView({ behavior: "smooth", block: "end" });
  });

  closeBtn?.addEventListener("click", () => {
    visibleCount = 4;
    updateProducts();
    document
      .getElementById("catalog-section")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  updateProducts();
});

// ------------------- Модалка отзывов -------------------
function openReviewModal() {
  const modal = document.getElementById("review-modal");
  if (!modal) return;
  modal.style.display = "flex";
  document.body.classList.add("modal-open");
}

function closeReviewModal() {
  const modal = document.getElementById("review-modal");
  if (!modal) return;
  modal.style.display = "none";
  document.body.classList.remove("modal-open");
}

// ------------------- Профиль пользователя -------------------
document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("profileModal");
  const openBtn =
    document.getElementById("userBtn") || document.querySelector(".fa-user");
  const closeBtn = modal?.querySelector(".profile-close");
  const form = document.getElementById("profileForm");

  // Открытие модалки
  openBtn?.addEventListener("click", () => {
    modal.style.display = "flex";
    document.body.style.overflow = "hidden";
    loadProfile();
  });

  // Закрытие модалки
  closeBtn?.addEventListener("click", () => {
    modal.style.display = "none";
    document.body.style.overflow = "";
  });

  window.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.style.display = "none";
      document.body.style.overflow = "";
    }
  });

  // Сохранение профиля
  form?.addEventListener("submit", (e) => {
    e.preventDefault();

    const profile = {
      firstName: document.getElementById("firstName").value.trim(),
      lastName: document.getElementById("lastName").value.trim(),
      phone: document.getElementById("phone").value.trim(),
      telegram: document.getElementById("telegram").value.trim(),
      address: document.getElementById("address").value.trim(),
      extra: document.getElementById("extra").value.trim(),
    };

    if (
      !profile.firstName ||
      !profile.lastName ||
      !profile.phone ||
      !profile.address
    ) {
      return alert(
        "❗ Заполните все обязательные поля (Имя, Фамилия, Телефон, Адрес)"
      );
    }

    localStorage.setItem("userProfile", JSON.stringify(profile));
    alert("✅ Профиль сохранён!");
    modal.style.display = "none";
    document.body.style.overflow = "";
  });

  // Кнопка геолокации
  document.getElementById("geoBtn")?.addEventListener("click", () => {
    if (!navigator.geolocation) return alert("Геолокация не поддерживается.");

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        document.getElementById(
          "address"
        ).value = `Моя локация: ${latitude}, ${longitude}`;
        localStorage.setItem(
          "userLocation",
          JSON.stringify({ lat: latitude, lon: longitude })
        );
        alert("📍 Геолокация сохранена!");
      },
      () => alert("❌ Не удалось получить геолокацию")
    );
  });
});

// ------------------- Загрузка профиля -------------------
function loadProfile() {
  const saved = JSON.parse(localStorage.getItem("userProfile")) || {};
  if (saved.firstName)
    document.getElementById("firstName").value = saved.firstName;
  if (saved.lastName)
    document.getElementById("lastName").value = saved.lastName;
  if (saved.phone) document.getElementById("phone").value = saved.phone;
  if (saved.telegram)
    document.getElementById("telegram").value = saved.telegram;
  if (saved.address) document.getElementById("address").value = saved.address;
  if (saved.extra) document.getElementById("extra").value = saved.extra;
}

// ------------------- Работа с корзиной -------------------
function getCart() {
  return JSON.parse(localStorage.getItem("cart")) || [];
}

function saveCart(cart) {
  localStorage.setItem("cart", JSON.stringify(cart));
}

function updateCartCount() {
  const cart = getCart();
  const total = cart.reduce((sum, item) => sum + item.count, 0);
  const cartCountEl = document.getElementById("cart-count");
  if (cartCountEl) {
    cartCountEl.innerText = total;
    cartCountEl.style.display = total > 0 ? "inline-block" : "none";
  }
}

function renderCart() {
  const cart = getCart();
  const cartContainer = document.getElementById("cart-items");
  if (!cartContainer) return;

  cartContainer.innerHTML = "";

  cart.forEach((item) => {
    const el = document.createElement("div");
    el.classList.add("cart-item");
    el.innerHTML = `
      <img src="${item.img}" alt="${item.name}" class="cart-item-img">
      <div class="cart-item-info">
        <div class="cart-item-title">${item.name}</div>
        <div class="cart-item-price">${item.price}</div>
        <div class="cart-item-count">Кол-во: ${item.count}</div>
      </div>
    `;
    cartContainer.appendChild(el);
  });
}

// ------------------- Добавление товара в корзину -------------------
document.addEventListener("click", (e) => {
  const addBtn = e.target.closest(".add-to-cart");
  if (!addBtn) return;

  const cart = getCart();
  const productEl = addBtn.closest(".product");
  if (!productEl) return;

  const name =
    productEl.querySelector(".product-title")?.innerText || "Без названия";
  const price = productEl.querySelector(".product-price")?.innerText || "0 ₽";
  const img = productEl.querySelector("img")?.src || "";

  const existing = cart.find((item) => item.name === name);
  if (existing) {
    existing.count++;
    existing.sizes.push("");
  } else {
    cart.push({ name, price, img, count: 1, sizes: [""] });
  }

  saveCart(cart);
  renderCart();
  updateCartCount();
});

// ------------------- Инициализация корзины при загрузке -------------------
document.addEventListener("DOMContentLoaded", () => {
  renderCart();
  updateCartCount();
});

document.addEventListener("DOMContentLoaded", () => {
  const searchIcon = document.getElementById("search-icon");
  const searchInput = document.getElementById("search-input");
  const products = document.querySelectorAll(".product");

  // Клик по иконке — показать/скрыть
  searchIcon.addEventListener("click", (e) => {
    e.stopPropagation();

    if (searchInput.classList.contains("active")) {
      searchInput.classList.remove("active");
      searchInput.value = "";
      products.forEach((p) => (p.style.display = "block"));
    } else {
      searchInput.classList.add("active");
      setTimeout(() => searchInput.focus(), 100);
    }
  });

  // Клик вне поля — закрыть поиск
  document.addEventListener("click", () => {
    if (searchInput.classList.contains("active")) {
      searchInput.classList.remove("active");
      searchInput.value = "";
      products.forEach((p) => (p.style.display = "block"));
    }
  });

  // Не закрывать при клике на input
  searchInput.addEventListener("click", (e) => e.stopPropagation());

  // Фильтрация
  searchInput.addEventListener("input", () => {
    const query = searchInput.value.toLowerCase();
    products.forEach((product) => {
      const title = product
        .querySelector(".product-title")
        .innerText.toLowerCase();
      product.style.display = title.includes(query) ? "block" : "none";
    });
  });
});
