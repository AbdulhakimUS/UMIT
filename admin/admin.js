// =============================================
// UMIT ADMIN PANEL - JavaScript
// =============================================

let currentUser = null;

// ------------------- АВТОРИЗАЦИЯ -------------------
document.addEventListener('DOMContentLoaded', async () => {
  // Проверка страницы
  const isLoginPage = document.getElementById('loginForm');
  const isPanelPage = document.getElementById('sidebar');
  
  // Проверка авторизации
  const { data: { session } } = await supabase.auth.getSession();
  
  if (isLoginPage) {
    if (session) {
      window.location.href = 'panel.html';
      return;
    }
    setupLoginForm();
  }
  
  if (isPanelPage) {
    if (!session) {
      window.location.href = 'index.html';
      return;
    }
    currentUser = session.user;
    initPanel();
  }
});

function setupLoginForm() {
  document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorMsg = document.getElementById('errorMsg');
    
    errorMsg.textContent = '';
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) {
      errorMsg.textContent = 'Неверный email или пароль';
      return;
    }
    
    window.location.href = 'panel.html';
  });
}

// ------------------- ПАНЕЛЬ -------------------
async function initPanel() {
  document.getElementById('userEmail').textContent = currentUser.email;
  
  // Навигация
  setupNavigation();
  
  // Выход
  document.getElementById('logoutBtn').addEventListener('click', async () => {
    await supabase.auth.signOut();
    window.location.href = 'index.html';
  });
  
  // Гамбургер меню
  document.getElementById('hamburger').addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('active');
  });
  
  // Формы
  document.getElementById('productForm').addEventListener('submit', handleProductSubmit);
  document.getElementById('reviewForm').addEventListener('submit', handleReviewSubmit);
  
  // Превью изображения
  document.getElementById('productImage').addEventListener('change', previewImage);
  
  // Загрузка данных
  await loadDashboard();
  await loadContent();
}

function setupNavigation() {
  const navItems = document.querySelectorAll('.nav-item');
  
  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      
      // Активный пункт меню
      navItems.forEach(n => n.classList.remove('active'));
      item.classList.add('active');
      
      // Показать секцию
      const section = item.dataset.section;
      document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
      document.getElementById(`section-${section}`).classList.add('active');
      
      // Заголовок
      document.getElementById('pageTitle').textContent = item.textContent.trim();
      
      // Закрыть мобильное меню
      document.getElementById('sidebar').classList.remove('active');
      
      // Загрузить данные секции
      loadSectionData(section);
    });
  });
}

async function loadSectionData(section) {
  switch(section) {
    case 'dashboard':
      await loadDashboard();
      break;
    case 'products':
      await loadProducts();
      break;
    case 'orders':
      await loadOrders();
      break;
    case 'reviews':
      await loadReviews();
      break;
    case 'content':
      await loadAllContent();
      break;
  }
}

// ------------------- ДАШБОРД -------------------
async function loadDashboard() {
  try {
    const [products, orders, reviews] = await Promise.all([
      supabase.from('products').select('id', { count: 'exact' }),
      supabase.from('orders').select('id, total, status, customer_name, created_at'),
      supabase.from('reviews').select('id', { count: 'exact' })
    ]);
    
    document.getElementById('totalProducts').textContent = products.count || 0;
    document.getElementById('totalOrders').textContent = orders.data?.length || 0;
    document.getElementById('totalReviews').textContent = reviews.count || 0;
    
    const revenue = orders.data?.reduce((sum, o) => sum + (o.total || 0), 0) || 0;
    document.getElementById('totalRevenue').textContent = revenue.toLocaleString();
    
    // Последние заказы
    const recentOrders = orders.data?.slice(0, 5) || [];
    renderRecentOrders(recentOrders);
  } catch (error) {
    console.error('Dashboard error:', error);
  }
}

function renderRecentOrders(orders) {
  const container = document.getElementById('recentOrdersList');
  if (!orders.length) {
    container.innerHTML = '<p style="color: var(--text-gray);">Нет заказов</p>';
    return;
  }
  
  container.innerHTML = orders.map(order => `
    <div class="order-card">
      <div class="order-header">
        <span class="order-id">#${order.id.slice(0,8)}</span>
        <span class="order-status ${order.status}">${getStatusText(order.status)}</span>
      </div>
      <div class="order-info">
        <div class="order-info-item">
          <strong>Клиент:</strong> ${order.customer_name}
        </div>
        <div class="order-info-item">
          <strong>Дата:</strong> ${new Date(order.created_at).toLocaleDateString('ru-RU')}
        </div>
      </div>
      <div class="order-total">Итого: ${order.total.toLocaleString()} ₽</div>
    </div>
  `).join('');
}

// ------------------- КОНТЕНТ -------------------
async function loadContent() {
  const { data, error } = await supabase.from('site_content').select('*');
  
  if (data) {
    data.forEach(item => {
      const input = document.getElementById(item.section_key);
      if (input) {
        input.value = item.content_value || '';
      }
    });
  }
}

async function loadAllContent() {
  const { data, error } = await supabase.from('site_content').select('*');
  const container = document.getElementById('contentList');
  
  if (!data || !data.length) {
    container.innerHTML = '<p>Нет данных</p>';
    return;
  }
  
  container.innerHTML = data.map(item => `
    <div class="edit-card">
      <label>${item.section_key}</label>
      <div class="edit-row">
        <input type="text" id="content_${item.section_key}" value="${item.content_value || ''}">
        <button class="btn-save" onclick="saveContent('${item.section_key}', 'content_')">
          <i class="fa-solid fa-floppy-disk"></i> Сохранить
        </button>
      </div>
    </div>
  `).join('');
}

async function saveContent(key, prefix = '') {
  const inputId = prefix ? `${prefix}${key}` : key;
  const input = document.getElementById(inputId);
  if (!input) return;

  const newValue = input.value;

  // Получить старое значение для истории
  const { data: oldData } = await supabase
    .from('site_content')
    .select('content_value')
    .eq('section_key', key)
    .maybeSingle();

  // Сохранить историю
  if (oldData) {
    await supabase.from('content_history').insert({
      section_key: key,
      old_value: oldData.content_value,
      new_value: newValue,
      admin_email: currentUser.email
    });
  }

  // Обновить контент (с указанием onConflict)
  const { error } = await supabase
    .from('site_content')
    .upsert(
      { section_key: key, content_value: newValue, updated_at: new Date().toISOString() },
      { onConflict: 'section_key' }
    );

  if (error) {
    console.error('Save error:', error);
    showToast('Ошибка сохранения', 'error');
  } else {
    showToast('Сохранено успешно!');
  }
}


// ------------------- ТОВАРЫ -------------------
async function loadProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });
  
  const container = document.getElementById('productsList');
  
  if (!data || !data.length) {
    container.innerHTML = '<p style="color: var(--text-gray);">Нет товаров</p>';
    return;
  }
  
  container.innerHTML = data.map(p => `
    <div class="product-card">
      <img src="${p.image_url || '../img/placeholder.png'}" alt="${p.name}" onerror="this.src='../img/placeholder.png'">
      <div class="product-card-body">
        <h3>${p.name}</h3>
        <div class="price">${p.price.toLocaleString()} ₽</div>
        <div class="product-card-actions">
          <button class="btn-edit" onclick="editProduct('${p.id}')">
            <i class="fa-solid fa-pen"></i> Изменить
          </button>
          <button class="btn-delete" onclick="deleteProduct('${p.id}')">
            <i class="fa-solid fa-trash"></i>
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

function openProductModal(product = null) {
  document.getElementById('productModal').classList.add('active');
  document.getElementById('productModalTitle').textContent = product ? 'Редактировать товар' : 'Добавить товар';
  document.getElementById('productForm').reset();
  document.getElementById('productId').value = product?.id || '';
  document.getElementById('productImagePreview').style.display = 'none';
  
  if (product) {
    document.getElementById('productName').value = product.name;
    document.getElementById('productPrice').value = product.price;
    document.getElementById('productDesc').value = product.description || '';
    document.getElementById('productCategory').value = product.category || 'other';
    if (product.image_url) {
      document.getElementById('productImagePreview').src = product.image_url;
      document.getElementById('productImagePreview').style.display = 'block';
    }
  }
}

function closeProductModal() {
  document.getElementById('productModal').classList.remove('active');
}

async function editProduct(id) {
  const { data } = await supabase.from('products').select('*').eq('id', id).single();
  if (data) openProductModal(data);
}

async function deleteProduct(id) {
  if (!confirm('Удалить товар?')) return;
  
  const { error } = await supabase.from('products').delete().eq('id', id);
  
  if (error) {
    showToast('Ошибка удаления', 'error');
  } else {
    showToast('Товар удалён');
    loadProducts();
  }
}

async function handleProductSubmit(e) {
  e.preventDefault();
  
  const id = document.getElementById('productId').value;
  const name = document.getElementById('productName').value;
  const price = parseInt(document.getElementById('productPrice').value);
  const description = document.getElementById('productDesc').value;
  const category = document.getElementById('productCategory').value;
  const imageFile = document.getElementById('productImage').files[0];
  
  let image_url = null;
  
  // Загрузка изображения
  if (imageFile) {
    const fileName = `products/${Date.now()}_${imageFile.name}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('images')
      .upload(fileName, imageFile);
    
    if (uploadError) {
      showToast('Ошибка загрузки изображения', 'error');
      return;
    }
    
    const { data: { publicUrl } } = supabase.storage.from('images').getPublicUrl(fileName);
    image_url = publicUrl;
  }
  
  const productData = { name, price, description, category, updated_at: new Date().toISOString() };
  if (image_url) productData.image_url = image_url;
  
  let result;
  if (id) {
    result = await supabase.from('products').update(productData).eq('id', id);
  } else {
    result = await supabase.from('products').insert(productData);
  }
  
  if (result.error) {
    showToast('Ошибка сохранения', 'error');
  } else {
    showToast('Товар сохранён!');
    closeProductModal();
    loadProducts();
  }
}

// ------------------- ЗАКАЗЫ -------------------
async function loadOrders() {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });
  
  renderOrders(data || []);
}

async function filterOrders() {
  const status = document.getElementById('orderStatusFilter').value;
  
  let query = supabase.from('orders').select('*').order('created_at', { ascending: false });
  
  if (status !== 'all') {
    query = query.eq('status', status);
  }
  
  const { data } = await query;
  renderOrders(data || []);
}

function renderOrders(orders) {
  const container = document.getElementById('ordersList');
  
  if (!orders.length) {
    container.innerHTML = '<p style="color: var(--text-gray);">Нет заказов</p>';
    return;
  }
  
  container.innerHTML = orders.map(order => `
    <div class="order-card">
      <div class="order-header">
        <span class="order-id">#${order.id.slice(0,8)}</span>
        <span class="order-status ${order.status}">${getStatusText(order.status)}</span>
      </div>
      <div class="order-info">
        <div class="order-info-item"><strong>Клиент:</strong> ${order.customer_name}</div>
        <div class="order-info-item"><strong>Телефон:</strong> ${order.customer_phone}</div>
        <div class="order-info-item"><strong>Адрес:</strong> ${order.customer_address || '—'}</div>
        <div class="order-info-item"><strong>Telegram:</strong> ${order.customer_telegram || '—'}</div>
        <div class="order-info-item"><strong>Дата:</strong> ${new Date(order.created_at).toLocaleString('ru-RU')}</div>
      </div>
      <div class="order-items">
        <h4>Товары:</h4>
        ${order.items.map(item => `
          <div class="order-item">
            <span>${item.name} × ${item.count}</span>
            <span>${item.sizes?.join(', ') || '—'}</span>
          </div>
        `).join('')}
      </div>
      <div class="order-total">Итого: ${order.total.toLocaleString()} ₽</div>
      <div class="order-actions">
        <select onchange="updateOrderStatus('${order.id}', this.value)">
          <option value="new" ${order.status === 'new' ? 'selected' : ''}>Новый</option>
          <option value="processing" ${order.status === 'processing' ? 'selected' : ''}>В обработке</option>
          <option value="completed" ${order.status === 'completed' ? 'selected' : ''}>Выполнен</option>
          <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Отменён</option>
        </select>
      </div>
    </div>
  `).join('');
}

async function updateOrderStatus(id, status) {
  const { error } = await supabase.from('orders').update({ status }).eq('id', id);
  
  if (error) {
    showToast('Ошибка обновления', 'error');
  } else {
    showToast('Статус обновлён');
  }
}

function getStatusText(status) {
  const texts = {
    new: 'Новый',
    processing: 'В обработке',
    completed: 'Выполнен',
    cancelled: 'Отменён'
  };
  return texts[status] || status;
}

// ------------------- ОТЗЫВЫ -------------------
async function loadReviews() {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .order('created_at', { ascending: false });
  
  const container = document.getElementById('reviewsList');
  
  if (!data || !data.length) {
    container.innerHTML = '<p style="color: var(--text-gray);">Нет отзывов</p>';
    return;
  }
  
  container.innerHTML = data.map(r => `
    <div class="review-card">
      <div class="review-header">
        <span class="review-user">${r.username}</span>
        <span class="review-rating">${'⭐'.repeat(r.rating)}</span>
      </div>
      <p class="review-text">${r.review_text}</p>
      <div class="review-actions">
        <button class="btn-edit" onclick="editReview('${r.id}')">
          <i class="fa-solid fa-pen"></i>
        </button>
        <button class="btn-delete" onclick="deleteReview('${r.id}')">
          <i class="fa-solid fa-trash"></i>
        </button>
      </div>
    </div>
  `).join('');
}

function openReviewModal(review = null) {
  document.getElementById('reviewModal').classList.add('active');
  document.getElementById('reviewModalTitle').textContent = review ? 'Редактировать отзыв' : 'Добавить отзыв';
  document.getElementById('reviewForm').reset();
  document.getElementById('reviewId').value = review?.id || '';
  
  if (review) {
    document.getElementById('reviewUsername').value = review.username;
    document.getElementById('reviewText').value = review.review_text;
    document.getElementById('reviewRating').value = review.rating;
  }
}

function closeReviewModal() {
  document.getElementById('reviewModal').classList.remove('active');
}

async function editReview(id) {
  const { data } = await supabase.from('reviews').select('*').eq('id', id).single();
  if (data) openReviewModal(data);
}

async function deleteReview(id) {
  if (!confirm('Удалить отзыв?')) return;
  
  const { error } = await supabase.from('reviews').delete().eq('id', id);
  
  if (error) {
    showToast('Ошибка удаления', 'error');
  } else {
    showToast('Отзыв удалён');
    loadReviews();
  }
}

async function handleReviewSubmit(e) {
  e.preventDefault();
  
  const id = document.getElementById('reviewId').value;
  const username = document.getElementById('reviewUsername').value;
  const review_text = document.getElementById('reviewText').value;
  const rating = parseInt(document.getElementById('reviewRating').value);
  
  const reviewData = { username, review_text, rating };
  
  let result;
  if (id) {
    result = await supabase.from('reviews').update(reviewData).eq('id', id);
  } else {
    result = await supabase.from('reviews').insert(reviewData);
  }
  
  if (result.error) {
    showToast('Ошибка сохранения', 'error');
  } else {
    showToast('Отзыв сохранён!');
    closeReviewModal();
    loadReviews();
  }
}

// ------------------- УТИЛИТЫ -------------------
function previewImage(e) {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (event) => {
      const preview = document.getElementById('productImagePreview');
      preview.src = event.target.result;
      preview.style.display = 'block';
    };
    reader.readAsDataURL(file);
  }
}

function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = 'toast ' + type;
  toast.classList.add('show');
  
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}
