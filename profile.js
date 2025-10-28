document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("profileModal");
  const openBtn =
    document.getElementById("userBtn") || document.querySelector(".fa-user");
  const closeBtn = modal.querySelector(".profile-close");
  const form = document.getElementById("profileForm");

  // ===== Открытие модалки =====
  if (openBtn) {
    openBtn.addEventListener("click", () => {
      modal.style.display = "flex";
      document.body.style.overflow = "hidden"; // запрет скролла
      loadProfile(); // при каждом открытии подтягиваем данные
    });
  }

  // ===== Закрытие модалки =====
  function closeModal() {
    modal.style.display = "none";
    document.body.style.overflow = ""; // вернуть скролл
  }
  if (closeBtn) closeBtn.addEventListener("click", closeModal);
  window.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });

  // ===== Сохранение профиля =====
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const profile = {
        firstName: document.getElementById("firstName").value.trim(),
        lastName: document.getElementById("lastName").value.trim(),
        phone: document.getElementById("phone").value.trim(),
        telegram: document.getElementById("telegram").value.trim(),
        address: document.getElementById("address").value.trim(),
        extra: document.getElementById("extra").value.trim(),
      };

      // 🚨 Проверка обязательных полей
      if (
        !profile.firstName ||
        !profile.lastName ||
        !profile.phone ||
        !profile.address
      ) {
        alert(
          "❗ Заполните все обязательные поля: Имя, Фамилия, Телефон и Адрес."
        );
        return;
      }

      // Сохраняем в localStorage
      localStorage.setItem("userProfile", JSON.stringify(profile));
      alert("✅ Данные сохранены!");
      closeModal();
    });
  }

  // ===== Загрузка профиля =====
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

  // ===== Кнопка геолокации =====
  const geoBtn = document.getElementById("geoBtn");
  if (geoBtn) {
    geoBtn.addEventListener("click", () => {
      if (!navigator.geolocation) {
        alert("❌ Геолокация не поддерживается вашим браузером.");
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          const addressField = document.getElementById("address");

          // Пишем координаты в поле адреса
          addressField.value = `Моя локация: ${latitude}, ${longitude}`;

          // Сохраняем в localStorage
          const savedProfile =
            JSON.parse(localStorage.getItem("userProfile")) || {};
          savedProfile.address = addressField.value;
          localStorage.setItem("userProfile", JSON.stringify(savedProfile));

          localStorage.setItem(
            "userLocation",
            JSON.stringify({ lat: latitude, lon: longitude })
          );
        },
        () => alert("❌ Не удалось получить геолокацию")
      );
    });
  }
});

const input = document.getElementById("telegram");

// При фокусе — добавляем '@' если его нет, и ставим курсор после него
input.addEventListener("focus", () => {
  if (!input.value.startsWith("@")) {
    input.value = "@" + input.value;
  }
  // ставим курсор после @ (если пользователь не хочет редактировать начало, он может переместить курсор)
  try {
    input.setSelectionRange(1, 1);
  } catch (e) {
    // в старых браузерах возможно не поддерживается — просто ничего
  }
});

// При потере фокуса — если в поле только '@', очищаем его
input.addEventListener("blur", () => {
  if (input.value === "@") {
    input.value = "";
  }
});

// Дополнительно: если пользователь вставил или ввёл пробел в начале — убираем ведущие пробелы,
// но сохраняем @ в начале (если он есть)
input.addEventListener("input", () => {
  // удаляем только ведущие пробелы, но не трогаем остальную часть
  if (input.value.length > 0) {
    // если пользователь ввёл пробелы перед @ — убираем их
    input.value = input.value.replace(/^\s+/, "");
  }
});
