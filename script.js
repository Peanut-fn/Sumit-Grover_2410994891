/* ---------- Data ----------
   To use a real photo, add  img: 'https://...'  to a product.
   The drawn bottle is shown automatically if the image fails to load. */
const products = [
  { id: 1, name: 'No. 5',            brand: 'Chanel',             origin: 'French',         family: 'Floral', size: '50 ml',  price: 12500, liquid: '#e3cf9f', img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS5YH9OqQkUqNbmp7hnGG55VcK7aUxECcu2jOK6P21xCQ&s=10', note: 'The timeless floral aldehyde. Powdery, polished and unmistakable.' },
  { id: 2, name: "Libre L'Eau Nue",  brand: 'Yves Saint Laurent', origin: 'French',         family: 'Floral', size: '50 ml',  price: 8990,  liquid: '#dccab6', img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcStndQYjp8gjTOvts_E7aUsHRI0uvt1nWkpKUNeU5oOhU56xaSBcsFj68Y&s=10', note: 'A soft, skin-close parfum with a light and luminous finish.' },
  { id: 3, name: 'La Vie Est Belle', brand: 'Lancôme',            origin: 'French',         family: 'Floral', size: '75 ml',  price: 9690,  liquid: '#e6cbbd', img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSKHWPLB7-1aQ-HLNk34A4TJmsg_u9DsoNHdwuYzI2yUg&s=10', note: 'Iris and praline resting on a warm, softly sweet base.' },
  { id: 4, name: 'Divine',           brand: 'Jean Paul Gaultier', origin: 'French',         family: 'Floral', size: '100 ml', price: 12750, liquid: '#e8d3c4', img: 'https://images-static.nykaa.com/media/catalog/product/8/6/865e51fJEANP00000123_2.jpg?tr=w-500', note: 'Bergamot and red berries opening onto a soft floral heart.' },
  { id: 5, name: '9pm',              brand: 'Afnan',              origin: 'Middle Eastern', family: 'Warm',   size: '100 ml', price: 3150,  liquid: '#a47852', img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT8YcTBvIdDQTXeWzyKcGWgg4JZtFXyX_BnNzgHV6LC1yaMi_8wv5oQ3Z0&s=10', note: 'Sweet amber with a modern, easy character for the evening.' },
  { id: 6, name: 'Hawas Ice',        brand: 'Rasasi',             origin: 'Middle Eastern', family: 'Fresh',  size: '100 ml', price: 3300,  liquid: '#c3d1cf', img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTQaeOteuxQasJkma3rynvkMG9uqiIKnGZCQM4cyRLf4b04ehJ8Kg-LuSE5&s=10', note: 'Crisp citrus over an aquatic base. Clean and fresh.' }
  /* Khamrah (Lattafa, 100 ml, Rs. 3,499, Warm) was removed because no image was supplied. */
];
const origins = ['All', 'French', 'Middle Eastern'];
const priceRanges = { all: [0, Infinity], u5: [0, 5000], m: [5000, 10000], o: [10000, Infinity] };
const COUPONS = {
  SUGANDH10: { type: 'percent', value: 10, label: '10% off' },
  FLAT500:   { type: 'flat', value: 500, min: 8000, label: '₹500 off' },
  FREESHIP:  { type: 'ship', label: 'complimentary delivery' }
};
const SHIPPING_FEE = 149, FREE_SHIPPING_ABOVE = 5000;
const DEFAULT_MSG = 'Available codes: SUGANDH10, FLAT500, FREESHIP';

/* ---------- State ---------- */
const state = { origin: 'All', family: 'all', price: 'all', sort: 'featured', coupon: null };
let cart = [];
try { cart = JSON.parse(localStorage.getItem('sugandh_cart')) || []; } catch (e) { cart = []; }

/* ---------- Helpers ---------- */
const $ = s => document.querySelector(s);
const byId = id => products.find(p => p.id === id);
const fmt = n => '₹' + n.toLocaleString('en-IN');
const saveCart = () => { try { localStorage.setItem('sugandh_cart', JSON.stringify(cart)); } catch (e) {} };
const row = (label, value, cls = '') => `<div class="${cls}"><dt>${label}</dt><dd>${value}</dd></div>`;
const bottle = c => `<svg viewBox="0 0 120 160" aria-hidden="true"><rect x="46" y="8" width="28" height="22" rx="3" fill="#3a352e"/><rect x="52" y="30" width="16" height="10" fill="#cfc8bb"/><rect x="24" y="40" width="72" height="108" rx="8" fill="#f8f5ef" stroke="#bdb5a7" stroke-width="1.5"/><rect x="29" y="84" width="62" height="59" rx="4" fill="${c}"/></svg>`;

/* ---------- Filtering and sorting ---------- */
function visibleProducts() {
  const [lo, hi] = priceRanges[state.price];
  const list = products.filter(p =>
    (state.origin === 'All' || p.origin === state.origin) &&
    (state.family === 'all' || p.family === state.family) &&
    p.price >= lo && p.price < hi
  );
  const sorters = {
    low: (a, b) => a.price - b.price,
    high: (a, b) => b.price - a.price,
    name: (a, b) => a.name.localeCompare(b.name)
  };
  if (sorters[state.sort]) list.sort(sorters[state.sort]);
  return list;
}

function renderPills() {
  $('#originPills').innerHTML = origins.map(o =>
    `<button data-origin="${o}" class="${o === state.origin ? 'active' : ''}">${o}</button>`).join('');
}

function renderProducts() {
  const list = visibleProducts();
  $('#resultCount').textContent = `${list.length} ${list.length === 1 ? 'fragrance' : 'fragrances'}`;
  $('#productGrid').innerHTML = list.length ? list.map(p => `
    <article class="card">
      <div class="thumb">${bottle(p.liquid)}
        ${p.img ? `<img src="${p.img}" referrerpolicy="no-referrer" alt="${p.brand} ${p.name}" onload="this.parentNode.classList.add('has-img')" onerror="this.remove()">` : ''}
        <span class="origin">${p.origin}</span>
      </div>
      <div class="card-body">
        <p class="brand-name">${p.brand}</p>
        <h3>${p.name}</h3>
        <p class="note">${p.note}</p>
        <div class="price-row"><span>Eau de parfum, ${p.size}</span><span>${fmt(p.price)}</span></div>
      </div>
      <button class="btn" data-add="${p.id}">Add to Cart</button>
    </article>`).join('')
    : '<p class="empty">No fragrances match these filters. Please adjust your selection.</p>';
}

/* ---------- Cart logic ---------- */
function addToCart(id) {
  const item = cart.find(i => i.id === id);
  item ? item.qty++ : cart.push({ id, qty: 1 });
  renderCart();
}
function changeQty(id, delta) {
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) cart = cart.filter(i => i.id !== id);
  renderCart();
}
function removeItem(id) {
  cart = cart.filter(i => i.id !== id);
  renderCart();
}

/* ---------- Price calculation ---------- */
function totals() {
  const subtotal = cart.reduce((sum, i) => sum + byId(i.id).price * i.qty, 0);
  const c = COUPONS[state.coupon];
  let discount = 0, freeShip = false;
  if (c) {
    if (c.type === 'percent') discount = Math.round(subtotal * c.value / 100);
    if (c.type === 'flat') discount = c.value;
    if (c.type === 'ship') freeShip = true;
  }
  const afterDiscount = subtotal - discount;
  const shipping = subtotal === 0 || freeShip || afterDiscount >= FREE_SHIPPING_ABOVE ? 0 : SHIPPING_FEE;
  return { subtotal, discount, shipping, total: afterDiscount + shipping };
}

function summaryHTML() {
  const t = totals();
  return row('Subtotal', fmt(t.subtotal))
    + (t.discount ? row(`Discount (${state.coupon})`, '- ' + fmt(t.discount), 'discount') : '')
    + row('Delivery', t.shipping ? fmt(t.shipping) : 'Complimentary')
    + row('Total', fmt(t.total), 'total');
}

/* ---------- Coupons ---------- */
function setMsg(text, type = '') {
  const el = $('#couponMsg');
  el.textContent = text;
  el.className = 'coupon-msg ' + type;
}
function applyCoupon(code) {
  const c = COUPONS[code];
  if (!c) return setMsg('This code is not valid.', 'err');
  if (c.min && totals().subtotal < c.min) return setMsg(`${code} requires a minimum order of ${fmt(c.min)}.`, 'err');
  state.coupon = code;
  setMsg(`${code} applied: ${c.label}.`, 'ok');
  renderCart();
}
function revalidateCoupon() {
  const c = COUPONS[state.coupon];
  if (c && c.min && totals().subtotal < c.min) {
    setMsg(`${state.coupon} was removed. Minimum order is ${fmt(c.min)}.`, 'err');
    state.coupon = null;
  }
}

/* ---------- Cart rendering ---------- */
function renderCart() {
  revalidateCoupon();
  $('#cartCount').textContent = cart.reduce((s, i) => s + i.qty, 0);
  $('#cartItems').innerHTML = cart.length ? cart.map(i => {
    const p = byId(i.id);
    return `
      <div class="line">
        <div class="mini">${bottle(p.liquid)}</div>
        <div class="line-info">
          <h4>${p.name}</h4>
          <p>${p.brand}, ${p.size}</p>
          <div class="qty">
            <button data-dec="${p.id}" aria-label="Decrease quantity">-</button>
            <span>${i.qty}</span>
            <button data-inc="${p.id}" aria-label="Increase quantity">+</button>
          </div>
        </div>
        <div class="line-end">
          <strong>${fmt(p.price * i.qty)}</strong>
          <button class="remove" data-remove="${p.id}">Remove</button>
        </div>
      </div>`;
  }).join('') : '<p class="empty">Your cart is empty.</p>';
  $('#cartFoot').hidden = !cart.length;
  $('#summary').innerHTML = summaryHTML();
  saveCart();
}

/* ---------- Drawer and checkout ---------- */
const openCart = () => document.body.classList.add('cart-open');
const closeCart = () => document.body.classList.remove('cart-open');

function openCheckout() {
  closeCart();
  $('#checkoutItems').innerHTML = cart.map(i => {
    const p = byId(i.id);
    return `<div class="co-line"><span>${p.brand} ${p.name} x ${i.qty}</span><span>${fmt(p.price * i.qty)}</span></div>`;
  }).join('');
  $('#checkoutTotals').innerHTML = summaryHTML();
  $('#checkoutForm').hidden = false;
  document.querySelector('.checkout-summary').hidden = false;
  $('#success').hidden = true;
  document.body.classList.add('modal-open');
}
function closeCheckout() { document.body.classList.remove('modal-open'); }

function placeOrder(e) {
  e.preventDefault();
  const total = fmt(totals().total);
  const email = new FormData(e.target).get('email');
  const orderNo = 'SG' + Math.floor(100000 + Math.random() * 900000);
  $('#successText').textContent = `Order ${orderNo} for ${total} is confirmed. A receipt will be sent to ${email}.`;
  $('#checkoutForm').hidden = true;
  document.querySelector('.checkout-summary').hidden = true;
  $('#success').hidden = false;
  cart = [];
  state.coupon = null;
  e.target.reset();
  setMsg(DEFAULT_MSG);
  renderCart();
}

/* ---------- Events ---------- */
document.addEventListener('click', e => {
  const t = e.target;
  if (t.dataset.origin) { state.origin = t.dataset.origin; renderPills(); renderProducts(); }
  if (t.dataset.add) {
    addToCart(+t.dataset.add);
    t.textContent = 'Added';
    setTimeout(() => { t.textContent = 'Add to Cart'; }, 900);
  }
  if (t.dataset.inc) changeQty(+t.dataset.inc, 1);
  if (t.dataset.dec) changeQty(+t.dataset.dec, -1);
  if (t.dataset.remove) removeItem(+t.dataset.remove);
});

$('#scentFilter').addEventListener('change', e => { state.family = e.target.value; renderProducts(); });
$('#priceFilter').addEventListener('change', e => { state.price = e.target.value; renderProducts(); });
$('#sort').addEventListener('change', e => { state.sort = e.target.value; renderProducts(); });

$('#openCart').addEventListener('click', openCart);
$('#closeCart').addEventListener('click', closeCart);
$('#overlay').addEventListener('click', () => { closeCart(); closeCheckout(); });
$('#checkoutBtn').addEventListener('click', openCheckout);
$('#closeModal').addEventListener('click', () => { closeCheckout(); openCart(); });
$('#doneBtn').addEventListener('click', closeCheckout);
$('#checkoutForm').addEventListener('submit', placeOrder);
document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeCart(); closeCheckout(); } });

$('#couponForm').addEventListener('submit', e => {
  e.preventDefault();
  const code = $('#couponInput').value.trim().toUpperCase();
  if (code) applyCoupon(code);
});

/* ---------- Init ---------- */
renderPills();
renderProducts();
renderCart();
