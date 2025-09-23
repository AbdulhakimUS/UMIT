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
const products = document.querySelectorAll(".product");
const showMoreBtn = document.getElementById("showMoreBtn");
const closeBtn = document.getElementById("closeBtn");

let visibleCount = 4; // показываем первые 4

function showProducts() {
  for (let i = 0; i < visibleCount && i < products.length; i++) {
    products[i].style.display = "block";
  }
}

showProducts(); // показать первые 4

showMoreBtn.addEventListener("click", () => {
  visibleCount += 4;
  showProducts();
  closeBtn.style.display = "inline-block"; // сразу показываем кнопку закрыть
  if (visibleCount >= products.length) {
    showMoreBtn.style.display = "none";
  }
});

closeBtn.addEventListener("click", () => {
  visibleCount = 4;
  products.forEach((p, i) => {
    p.style.display = i < 4 ? "block" : "none";
  });
  showMoreBtn.style.display = "inline-block";
  closeBtn.style.display = "none";
});
