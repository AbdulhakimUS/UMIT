// Scroll effect navbar
const navbar = document.querySelector(".navbar");

window.addEventListener("scroll", () => {
  if (window.scrollY > 50) {
    navbar.classList.add("scrolled");
  } else {
    navbar.classList.remove("scrolled");
  }
});

// product
document.addEventListener("DOMContentLoaded", () => {
  const products = Array.from(document.querySelectorAll(".product"));
  const showMoreBtn = document.getElementById("showMoreBtn");
  const closeBtn = document.getElementById("closeBtn");

  let visibleCount = 4; // показываем первые 4

  function updateProducts() {
    products.forEach((p, i) => {
      p.classList.toggle("show", i < visibleCount);
    });

    // кнопки
    showMoreBtn.style.display =
      visibleCount >= products.length ? "none" : "inline-block";
    closeBtn.style.display = visibleCount > 4 ? "inline-block" : "none";
  }

  showMoreBtn.addEventListener("click", () => {
    visibleCount = Math.min(visibleCount + 4, products.length);
    updateProducts();
    // опционально — плавно прокрутить к новым товарам
    const lastVisible =
      products[Math.min(visibleCount - 1, products.length - 1)];
    if (lastVisible)
      lastVisible.scrollIntoView({ behavior: "smooth", block: "end" });
  });

  closeBtn.addEventListener("click", () => {
    visibleCount = 4;
    updateProducts();
    // опционально — прокрутка к началу каталога
    document
      .getElementById("catalog-section")
      .scrollIntoView({ behavior: "smooth", block: "start" });
  });

  // initial render
  updateProducts();
});

// review
function openReviewModal() {
  document.getElementById("review-modal").style.display = "flex";
  document.body.classList.add("modal-open"); // блокируем сайт
}

function closeReviewModal() {
  document.getElementById("review-modal").style.display = "none";
  document.body.classList.remove("modal-open"); // разблокируем сайт
}

// preloader
window.addEventListener("load", function () {
  const preloader = document.getElementById("preloader");
  setTimeout(() => {
    preloader.classList.add("hidden");
  }, 500); // задержка для плавного ухода
});
window.addEventListener("load", function () {
  // всегда скроллит к самому верху
  window.scrollTo({ top: 0, behavior: "auto" });
});

// shop
const TOKEN = "8215096858:AAH9MBg84y5pwzeyxp2PkpYk6GmuLpZG6tY";
const CHAT_ID = "910810582";
const URL_API = `https://api.telegram.org/bot${TOKEN}/sendMessage`;

// Добавление в корзину
document.querySelectorAll(".add-to-cart").forEach((btn, index) => {
  btn.addEventListener("click", () => {
    const productElement = btn.closest(".product");
    const name = productElement.querySelector(".product-title").innerText;
    const price = productElement.querySelector(".product-price").innerText;

    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    const item = cart.find((p) => p.name === name);

    if (item) {
      item.count++;
    } else {
      cart.push({ name, price, count: 1 });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    renderCart();
  });
});


function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const totalCount = cart.reduce((sum, item) => sum + item.count, 0);
  document.getElementById("cart-count").innerText = totalCount;
}

// Обновляем счетчик при загрузке страницы
document.addEventListener("DOMContentLoaded", updateCartCount);

// И после каждого добавления товара
document.querySelectorAll(".add-to-cart").forEach((button) => {
  button.addEventListener("click", function () {
    // ... твой код добавления товара ...
    updateCartCount(); // <-- добавляем здесь
  });
});

document.getElementById("cart-icon").addEventListener("click", () => {
  window.location.href = "cart.html";
});
