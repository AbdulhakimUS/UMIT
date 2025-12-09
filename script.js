// =============================================
// UMIT - JavaScript (с Supabase)
// =============================================

// ------------------- Загрузка контента сайта из Supabase -------------------
async function loadSiteContent() {
  try {
    const { data, error } = await supabase.from("site_content").select("*");

    if (error) {
      console.error("Ошибка загрузки контента:", error);
      return;
    }

    if (data) {
      data.forEach((item) => {
        const element = document.querySelector(
          `[data-content="${item.section_key}"]`
        );
        if (element) {
          if (item.section_key === "hero_title") {
            element.innerHTML = item.content_value.replace(/\\n/g, "<br />");
          } else {
            element.textContent = item.content_value;
          }
        }
      });
    }
  } catch (err) {
    console.error("Ошибка:", err);
  }
}

// ------------------- Загрузка товаров из Supabase -------------------
async function loadProductsFromSupabase() {
  const container = document.getElementById("product-list");
  if (!container) return;

  container.innerHTML = '<div class="loading">Загрузка товаров...</div>';

  try {
    const { data: products, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Ошибка загрузки товаров:", error);
      container.innerHTML = '<p class="error">Ошибка загрузки товаров</p>';
      return;
    }

    if (!products || products.length === 0) {
      container.innerHTML = '<p style="color: red;">Товары не найдены</p>';
      return;
    }

    container.innerHTML = products
      .map(
        (product) => `
      <div class="product" data-id="${product.id}">
        <div class="product-img">
          <img src="${product.image_url || "./product/placeholder.jpg"}" alt="${
          product.name
        }" onerror="this.src='./product/placeholder.jpg'">
          <button class="add-to-cart">+</button>
        </div>
        <div class="product-title">${product.name}</div>
        <div class="product-price">${product.price.toLocaleString()} сум</div>
      </div>
    `
      )
      .join("");

    initProductVisibility();
  } catch (err) {
    console.error("Ошибка:", err);
    container.innerHTML = '<p class="error">Произошла ошибка</p>';
  }
}

// ------------------- Видимость товаров (показать ещё) -------------------
function initProductVisibility() {
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

  const newShowMoreBtn = showMoreBtn?.cloneNode(true);
  const newCloseBtn = closeBtn?.cloneNode(true);

  showMoreBtn?.parentNode?.replaceChild(newShowMoreBtn, showMoreBtn);
  closeBtn?.parentNode?.replaceChild(newCloseBtn, closeBtn);

  newShowMoreBtn?.addEventListener("click", () => {
    visibleCount = Math.min(visibleCount + 4, products.length);
    updateProducts();
    const lastVisible =
      products[Math.min(visibleCount - 1, products.length - 1)];
    lastVisible?.scrollIntoView({ behavior: "smooth", block: "end" });
  });

  newCloseBtn?.addEventListener("click", () => {
    visibleCount = 4;
    updateProducts();
    document
      .getElementById("catalog")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  updateProducts();
  initSearch(products);
}

// ------------------- Realtime обновления контента сайта -------------------
function subscribeToContentChanges() {
  supabase
    .channel("content-changes")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "site_content" },
      (payload) => {
        console.log("Изменение контента:", payload);
        loadSiteContent(); // Перезагрузить контент
      }
    )
    .subscribe();
}

// ------------------- Загрузка контента сайта -------------------
async function loadSiteContent() {
  try {
    const { data, error } = await supabase.from("site_content").select("*");
    if (error) {
      console.error("Ошибка загрузки контента:", error);
      return;
    }
    if (data) {
      data.forEach((item) => {
        const el = document.querySelector(
          `[data-content="${item.section_key}"]`
        );
        if (el) {
          el.innerHTML = item.content_value.replace(/\\n/g, "<br>");
        }
      });
    }
  } catch (err) {
    console.error("Ошибка:", err);
  }
}

function subscribeToContentChanges() {
  supabase
    .channel("content-changes")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "site_content" },
      () => {
        loadSiteContent();
      }
    )
    .subscribe();
}

document.addEventListener("DOMContentLoaded", () => {
  loadProductsFromSupabase();
  loadSiteContent();
  subscribeToProductChanges();
  subscribeToContentChanges();
});

// ------------------- Поиск товаров -------------------
function initSearch(products) {
  const searchInput = document.getElementById("search-input");
  if (!searchInput) return;

  const newInput = searchInput.cloneNode(true);
  searchInput.parentNode.replaceChild(newInput, searchInput);

  newInput.addEventListener("input", () => {
    const query = newInput.value.toLowerCase();
    products.forEach((product) => {
      const title =
        product.querySelector(".product-title")?.innerText.toLowerCase() || "";
      product.style.display = title.includes(query) ? "block" : "none";
    });
  });
}

// ------------------- Navbar scroll -------------------
const navbar = document.querySelector(".navbar");
if (navbar) {
  window.addEventListener("scroll", () => {
    navbar.classList.toggle("scrolled", window.scrollY > 50);
  });
}

// ------------------- Прелоадер -------------------
window.addEventListener("load", () => {
  const preloader = document.getElementById("preloader");
  if (preloader) {
    setTimeout(() => preloader.classList.add("hidden"), 500);
  }
  window.scrollTo({ top: 0, behavior: "auto" });
});

// ------------------- Модалка отзывов -------------------
// function openReviewModal() {
//   const modal = document.getElementById("review-modal");
//   if (!modal) return;
//   modal.style.display = "flex";
//   document.body.classList.add("modal-open");
// }

// function closeReviewModal() {
//   const modal = document.getElementById("review-modal");
//   if (!modal) return;
//   modal.style.display = "none";
//   document.body.classList.remove("modal-open");
// }

// ------------------- Профиль пользователя -------------------
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

  cartContainer.innerHTML = cart
    .map(
      (item) => `
    <div class="cart-item">
      <img src="${item.img}" alt="${item.name}" class="cart-item-img">
      <div class="cart-item-info">
        <div class="cart-item-title">${item.name}</div>
        <div class="cart-item-price">${item.price}</div>
        <div class="cart-item-count">Кол-во: ${item.count}</div>
      </div>
    </div>
  `
    )
    .join("");
}

// ------------------- Добавление товара в корзину -------------------
document.addEventListener("click", (e) => {
  const addBtn = e.target.closest(".add-to-cart");
  if (!addBtn) return;

  const productEl = addBtn.closest(".product");
  if (!productEl) return;

  const cart = getCart();
  const name =
    productEl.querySelector(".product-title")?.innerText || "Без названия";
  const price = productEl.querySelector(".product-price")?.innerText || "0 сум";
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

// ------------------- Телефон с префиксом +998 -------------------
(function () {
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
    if (
      (e.key === "Backspace" || e.key === "Delete") &&
      input.selectionStart <= prefix.length
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
})();

// ------------------- Мобильное меню -------------------
function toggleMenu() {
  const hamburger = document.querySelector(".hamburger");
  const menu = document.querySelector(".center-navbar");
  const backdrop = document.querySelector(".mobile-backdrop");

  hamburger?.classList.toggle("active");
  menu?.classList.toggle("active");
  backdrop?.classList.toggle("active");
}

// ------------------- Инициализация при загрузке -------------------
document.addEventListener("DOMContentLoaded", () => {
  // Загрузка данных из Supabase
  loadSiteContent();
  loadProductsFromSupabase();
  subscribeToProductChanges();

  // Корзина
  renderCart();
  updateCartCount();

  // Профиль
  const modal = document.getElementById("profileModal");
  const openBtn =
    document.getElementById("userIcon") || document.querySelector(".fa-user");
  const closeBtn = modal?.querySelector(".profile-close");
  const form = document.getElementById("profileForm");

  openBtn?.addEventListener("click", () => {
    if (modal) {
      modal.style.display = "flex";
      document.body.style.overflow = "hidden";
      loadProfile();
    }
  });

  closeBtn?.addEventListener("click", () => {
    if (modal) {
      modal.style.display = "none";
      document.body.style.overflow = "";
    }
  });

  window.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.style.display = "none";
      document.body.style.overflow = "";
    }
  });

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
      return alert("❗ Заполните все обязательные поля");
    }

    localStorage.setItem("userProfile", JSON.stringify(profile));
    alert("✅ Профиль сохранён!");
    modal.style.display = "none";
    document.body.style.overflow = "";
  });

  document.getElementById("geoBtn")?.addEventListener("click", () => {
    if (!navigator.geolocation) return alert("Геолокация не поддерживается.");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        document.getElementById("address").value = `${latitude}, ${longitude}`;
        localStorage.setItem(
          "userLocation",
          JSON.stringify({ lat: latitude, lon: longitude })
        );
        alert("📍 Геолокация сохранена!");
      },
      () => alert("❌ Не удалось получить геолокацию")
    );
  });

  // Закрытие мобильного меню при клике на ссылку
  document.querySelectorAll(".center-navbar a").forEach((link) => {
    link.addEventListener("click", () => {
      document.querySelector(".hamburger")?.classList.remove("active");
      document.querySelector(".center-navbar")?.classList.remove("active");
      document.querySelector(".mobile-backdrop")?.classList.remove("active");
    });
  });

  // Закрытие меню при клике на фон
  document.querySelector(".mobile-backdrop")?.addEventListener("click", () => {
    document.querySelector(".hamburger")?.classList.remove("active");
    document.querySelector(".center-navbar")?.classList.remove("active");
    document.querySelector(".mobile-backdrop")?.classList.remove("active");
  });

  // Поиск — иконка
  const searchIcon = document.getElementById("search-icon");
  const searchInput = document.getElementById("search-input");

  searchIcon?.addEventListener("click", (e) => {
    e.stopPropagation();
    searchInput?.classList.toggle("active");
    if (searchInput?.classList.contains("active")) {
      setTimeout(() => searchInput.focus(), 100);
    } else {
      searchInput.value = "";
    }
  });

  document.addEventListener("click", () => {
    if (searchInput?.classList.contains("active")) {
      searchInput.classList.remove("active");
      searchInput.value = "";
    }
  });

  searchInput?.addEventListener("click", (e) => e.stopPropagation());
});

// ================== МОДАЛЬНОЕ ОКНО ТОВАРА ==================
let currentModalProduct = null;
let selectedSize = null;

function openProductModal(product) {
  currentModalProduct = product;

  document.getElementById("modalProductName").textContent = product.name;
  document.getElementById("modalTitle").textContent = product.name;
  document.getElementById("modalMainImage").src =
    product.image_url || "./product/placeholder.jpg";
  document.getElementById("modalPrice").textContent =
    product.price.toLocaleString() + " сум";
  document.getElementById("modalDescription").textContent =
    product.description ||
    "Высококачественная мужская одежда из натуральных материалов. Идеально подходит для холодного времени года.";

  // Скидка
  const discountEl = document.getElementById("modalDiscount");
  if (product.old_price && product.old_price > product.price) {
    const discount = Math.round((1 - product.price / product.old_price) * 100);
    discountEl.textContent = "-" + discount + "%";
    discountEl.style.display = "block";
    document.getElementById("modalOldPrice").textContent =
      product.old_price.toLocaleString() + " сум";
    document.getElementById("modalOldPrice").style.display = "inline";
  } else {
    discountEl.style.display = "none";
    document.getElementById("modalOldPrice").style.display = "none";
  }

  // Размеры
  const sizes = ["S", "M", "L", "XL", "XXL"];
  const sizesContainer = document.getElementById("modalSizes");
  sizesContainer.innerHTML = sizes
    .map(
      (size) =>
        `<button class="size-btn" onclick="selectModalSize(this, '${size}')">${size}</button>`
    )
    .join("");
  selectedSize = null;

  // Миниатюры
  const thumbsContainer = document.getElementById("modalThumbs");
  const mainImg = product.image_url || "./product/placeholder.jpg";
  thumbsContainer.innerHTML = `
    <div class="product-modal-thumb active" onclick="changeModalImage('${mainImg}', this)">
      <img src="${mainImg}" alt="">
    </div>
  `;

  // Отзывы внутри модалки
  const reviewsList = document.getElementById("modalReviewsList");
  reviewsList.innerHTML = `
    <div class="review-card">
      <div class="review-header">
        <div class="review-avatar">А</div>
        <div class="review-stars"><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i></div>
      </div>
      <p class="review-text">Отличное качество! Очень доволен покупкой.</p>
      <p class="review-name">Азиз К.</p>
    </div>
    <div class="review-card">
      <div class="review-header">
        <div class="review-avatar">Ш</div>
        <div class="review-stars"><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star-half-stroke"></i></div>
      </div>
      <p class="review-text">Хороший товар, размер подошёл идеально.</p>
      <p class="review-name">Шахзод М.</p>
    </div>
  `;

  document.getElementById("productModal").classList.add("active");
  document.getElementById("productOverlay").classList.add("active");
  document.body.style.overflow = "hidden";
}

function closeProductModal() {
  document.getElementById("productModal").classList.remove("active");
  document.getElementById("productOverlay").classList.remove("active");
  document.body.style.overflow = "";
}

function selectModalSize(btn, size) {
  document
    .querySelectorAll("#modalSizes .size-btn")
    .forEach((b) => b.classList.remove("active"));
  btn.classList.add("active");
  selectedSize = size;
}

function changeModalImage(src, thumb) {
  document.getElementById("modalMainImage").src = src;
  document
    .querySelectorAll(".product-modal-thumb")
    .forEach((t) => t.classList.remove("active"));
  thumb.classList.add("active");
}

function addToCartFromModal() {
  if (!currentModalProduct) return;
  if (!selectedSize) {
    alert("Пожалуйста, выберите размер");
    return;
  }
  // Используй существующую логику корзины
  addProductToCart(currentModalProduct, selectedSize);
  closeProductModal();
}

// ------------------- Модальное окно отзывов -------------------
function openReviewModal() {
  const modal = document.getElementById("review-modal");
  if (modal) {
    modal.classList.add("active");
    document.body.style.overflow = "hidden";
  }
}

function closeReviewModal() {
  const modal = document.getElementById("review-modal");
  if (modal) {
    modal.classList.remove("active");
    document.body.style.overflow = "";
  }
}

// Закрытие при клике на фон модалки
document
  .getElementById("review-modal")
  ?.addEventListener("click", function (e) {
    if (e.target === this) {
      closeReviewModal();
    }
  });
