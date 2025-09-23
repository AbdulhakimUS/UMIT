document.querySelectorAll('.add-to-cart').forEach(button => {
  button.addEventListener('click', function() {
    const product = this.closest('.product');
    const name = product.querySelector('.product-title').innerText;
    const price = product.querySelector('.product-price').innerText;
    const img = product.querySelector('img').src; // сохраняем фото

    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const item = cart.find(p => p.name === name);

    if (item) {
      item.count++;
    } else {
      cart.push({ name, price, img, count: 1 });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    alert(`${name} добавлен в корзину!`);
  });
});

const TOKEN = "8215096858:AAH9MBg84y5pwzeyxp2PkpYk6GmuLpZG6tY";
const CHAT_ID = "910810582";
const URL_API = `https://api.telegram.org/bot${TOKEN}/sendMessage`;

function renderCart() {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  const container = document.getElementById('cart-items');
  container.innerHTML = "";
  let total = 0;

  if(cart.length === 0){
    container.innerHTML = "<p>Корзина пуста</p>";
    document.getElementById('totalPrice').innerText = "";
    return;
  }

  cart.forEach((item,index)=>{
    const priceNum = Number(item.price.replace(/\D/g,''));
    total += priceNum * item.count;

    const div = document.createElement('div');
    div.classList.add('cart-item');
    div.innerHTML = `
      <img src="${item.img}" alt="${item.name}">
      <div class="cart-details">
        <div>${item.name}</div>
        <div>${item.price}</div>
      </div>
      <div class="cart-actions">
        <button class="btn-minus">-</button>
        <span>${item.count}</span>
        <button class="btn-plus">+</button>
      </div>
    `;
    container.appendChild(div);

    div.querySelector('.btn-plus').onclick = ()=>{
      cart[index].count++;
      localStorage.setItem('cart', JSON.stringify(cart));
      renderCart();
    };
    div.querySelector('.btn-minus').onclick = ()=>{
      if(cart[index].count>1){
        cart[index].count--;
      } else {
        cart.splice(index,1);
      }
      localStorage.setItem('cart', JSON.stringify(cart));
      renderCart();
    };
  });

  document.getElementById('totalPrice').innerText = `Общая сумма: ${total.toLocaleString()} ₽`;
}

document.getElementById('checkout').onclick = ()=>{
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  if(cart.length===0){ alert("Корзина пуста!"); return; }

  let message = "🛒 Новый заказ:\n\n";
  cart.forEach((item,i)=>{
    message += `${i+1}) ${item.name} — ${item.count} шт. (${item.price})\n`;
  });

  fetch(URL_API, {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify({ chat_id: CHAT_ID, text: message })
  })
  .then(()=>{ alert("✅ Заказ отправлен в Telegram"); localStorage.removeItem('cart'); renderCart(); })
  .catch(()=>alert("❌ Ошибка отправки заказа"));
};

document.getElementById('clearCart').onclick = ()=>{
  localStorage.removeItem('cart');
  renderCart();
};

document.addEventListener('DOMContentLoaded', renderCart);

// Добавление товаров в корзину
document.querySelectorAll('.add-to-cart').forEach(button => {
  button.addEventListener('click', function() {
    const product = this.closest('.product');
    const name = product.querySelector('.product-title').innerText;
    const price = product.querySelector('.product-price').innerText;
    const img = product.querySelector('img').src; // сохраняем фото

    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const item = cart.find(p => p.name === name);

    if (item) {
      item.count++;
    } else {
      cart.push({ name, price, img, count: 1 });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    alert(`${name} добавлен в корзину!`);
  });
});
