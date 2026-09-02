const state = {
  catalog: null,
  view: 'home',
  category: null,
  language: 'en',
  cart: loadCart(),
  phone: new URLSearchParams(location.search).get('phone') || '',
};

const app = document.getElementById('app');
const cartDrawer = document.getElementById('cartDrawer');
const scrim = document.getElementById('scrim');

function loadCart(){ try{return JSON.parse(localStorage.getItem('tpp_cart')||'[]')}catch{return[]}}
function saveCart(){localStorage.setItem('tpp_cart',JSON.stringify(state.cart)); updateCartBadge()}
function money(n){return `₹${Number(n||0).toLocaleString('en-IN')}`}
function img(path){return `/product-images/${encodeURIComponent(path)}`}
function packImg(path,type){return type==='family'?`/family-packs/${encodeURIComponent(path)}`:`/combo-images/${encodeURIComponent(path)}`}
function itemById(id){for(const c of state.catalog.categories){const item=c.items.find(x=>x.id===id);if(item)return item}return state.catalog.bestsellers.find(x=>x.id===id)||null}
function findPack(id){return state.catalog.combos.find(x=>x.id===id)||state.catalog.familyPacks.find(x=>x.id===id)||null}
function cartCount(){return state.cart.reduce((s,x)=>s+x.qty,0)}
function cartTotal(){return state.cart.reduce((s,x)=>s+x.price*x.qty,0)}
function updateCartBadge(){document.getElementById('cartCount').textContent=cartCount()}
function render(html){app.innerHTML=`<div class="view-enter">${html}</div>`;window.scrollTo({top:0,behavior:'smooth'});updateCartBadge()}

function home(){
  const b = state.catalog.bestsellers.slice(0,4).map(cardMini).join('');
  render(`<section class="hero"><div><p class="eyebrow">Welcome to</p><h1>${state.catalog.storeName}</h1><p>A warm, animated ordering experience built for fast mobile checkout. Pick your favourites, adjust quantities, and place a Cash on Delivery order in a few taps.</p></div><div class="hero-card"><strong>🔥 Fresh from the kitchen</strong><span>Order your favourites with our simple mobile menu.</span></div></section>
  <section class="home-grid">
    ${homeBtn('🔥','Best Sellers','Customer favourites','bestsellers')}
    ${homeBtn('🍽️','Menu','Pizza, burgers, sides & drinks','menu')}
    ${homeBtn('🎁','Combo Deals','Value-packed combos','combos')}
    ${homeBtn('👨‍👩‍👧‍👦','Family Packs','Big meals for everyone','family')}
  </section>
  <div class="section-head"><div><p class="eyebrow">Popular now</p><h2>Best Sellers</h2></div><button class="ghost-btn" data-view="bestsellers">View all →</button></div>
  <div class="product-grid">${b}</div>`);
}
function homeBtn(icon,title,sub,action){return `<button class="home-btn" data-view="${action}"><span class="emoji">${icon}</span><strong>${title}</strong><small>${sub}</small></button>`}
function cardMini(item){return `<article class="product-card"><img class="product-img" src="${img(item.image)}" alt="${item.name}" loading="lazy"><div class="product-body"><div><div class="product-name">${item.name}</div><div class="price">${money(item.price)}</div></div><div class="product-actions"><button class="primary-btn wide" data-add="${item.id}">Add to Cart</button></div></div></article>`}

function menu(){
  const chips = state.catalog.categories.map(c=>`<button class="cat-chip ${state.category===c.key?'active':''}" data-category="${c.key}">${c.emoji} ${c.name}</button>`).join('');
  const cat = state.category ? state.catalog.categories.find(c=>c.key===state.category) : state.catalog.categories[0];
  if(!state.category) state.category = cat.key;
  const cards = cat.items.map(productCard).join('');
  render(`<div class="section-head"><div><button class="back-btn" data-view="home">← Home</button><p class="eyebrow">Browse</p><h2>Menu</h2></div></div><div class="category-row">${chips}</div><div class="section-head"><div><p class="eyebrow">${cat.emoji} Category</p><h2>${cat.name}</h2></div></div><div class="product-grid">${cards}</div>`)
}
function productCard(item){const cart=state.cart.find(x=>x.id===item.id&&!x.extraCheese); const qty=cart?.qty||0; return `<article class="product-card"><img class="product-img" src="${img(item.image)}" alt="${item.name}" loading="lazy"><div class="product-body"><div><div class="product-name">${item.name}</div><div class="price">${money(item.price)}</div>${item.extraCheese?`<div class="inline-note">🧀 Extra Cheese +${money(state.catalog.extraCheesePrice)}</div>`:''}</div><div class="product-actions">${qty?`<div class="qty-line"><div class="qty"><button data-change="${item.id}" data-delta="-1">−</button><span>${qty}</span><button data-change="${item.id}" data-delta="1">+</button></div><button class="primary-btn" data-add="${item.id}">Add</button></div>`:`<button class="primary-btn wide" data-add="${item.id}">Add to Cart</button>`}${item.extraCheese?`<button class="secondary-btn" data-add-cheese="${item.id}">🧀 Add with Extra Cheese</button>`:''}</div></div></article>`}

function bestsellers(){render(`<div class="section-head"><div><button class="back-btn" data-view="home">← Home</button><p class="eyebrow">Customer favourites</p><h2>Best Sellers</h2></div></div><div class="product-grid">${state.catalog.bestsellers.map(productCard).join('')}</div>`)}
function packs(type){const arr=type==='family'?state.catalog.familyPacks:state.catalog.combos; render(`<div class="section-head"><div><button class="back-btn" data-view="home">← Home</button><p class="eyebrow">Special offers</p><h2>${type==='family'?'Family Packs':'Combo Deals'}</h2></div></div><div class="packs">${arr.map(p=>`<article class="pack-card"><img src="${packImg(p.image,type)}" alt="${p.name}" loading="lazy"><div class="pack-body"><h3>${p.name}</h3><p>${p.description}</p><div class="price">${money(p.price)}</div><button class="primary-btn wide" data-add-pack="${p.id}">Add to Cart</button></div></article>`).join('')}</div>`)}

function addItem(id, cheese=false){const item=itemById(id);if(!item)return;const price=item.price+(cheese?state.catalog.extraCheesePrice:0);const key=`${id}:${cheese?'cheese':'plain'}`;const found=state.cart.find(x=>x.key===key);if(found)found.qty++;else state.cart.push({key,id,name:item.name+(cheese?' + Extra Cheese':''),price,qty:1,image:item.image,extraCheese:cheese,isCombo:false});saveCart()}
function addPack(id){const p=findPack(id);if(!p)return;const key=`${id}:pack`;const found=state.cart.find(x=>x.key===key);if(found)found.qty++;else state.cart.push({key,id,name:p.name,price:p.price,qty:1,image:p.image,extraCheese:false,isCombo:true,packType:state.catalog.familyPacks.some(x=>x.id===id)?'family':'combo'});saveCart()}
function changeItem(itemId,delta,extraCheese=false){const key=`${itemId}:${extraCheese?'cheese':'plain'}`;const i=state.cart.findIndex(x=>x.key===key);if(i<0)return;state.cart[i].qty+=delta;if(state.cart[i].qty<=0)state.cart.splice(i,1);saveCart(); if(state.view==='menu')menu();}

function openCart(){document.getElementById('cartItems').innerHTML=state.cart.length?state.cart.map(x=>`<div class="cart-row"><img src="${x.isCombo?packImg(x.image,x.packType):img(x.image)}" alt=""><div><h4>${x.name}</h4><small>${money(x.price)} each</small><div class="qty" style="margin-top:7px;width:max-content"><button data-cart-change="${x.key}" data-delta="-1">−</button><span>${x.qty}</span><button data-cart-change="${x.key}" data-delta="1">+</button></div></div><strong>${money(x.price*x.qty)}</strong></div>`).join(''):`<div class="empty-state"><div style="font-size:48px">🛒</div><p>Your cart is empty.</p><button class="primary-btn" data-view="menu">Browse Menu</button></div>`;document.getElementById('cartTotal').textContent=money(cartTotal());cartDrawer.classList.add('open');scrim.classList.add('open');cartDrawer.setAttribute('aria-hidden','false')}
function closeCart(){cartDrawer.classList.remove('open');scrim.classList.remove('open');cartDrawer.setAttribute('aria-hidden','true')}

function checkout(){if(!state.cart.length){openCart();return}closeCart();render(`<section class="checkout"><div class="section-head"><div><button class="back-btn" data-view="home">← Home</button><p class="eyebrow">Secure checkout</p><h2>Delivery Details</h2></div></div><div class="form-card"><h2>Almost there 🍕</h2><div class="field"><label>Your name</label><input id="customerName" placeholder="Enter your full name" autocomplete="name"></div><div class="field"><label>Delivery address</label><textarea id="customerAddress" placeholder="House / Shop, Street, Area, City"></textarea></div><div class="payment-card"><span>💵</span><div><strong>Cash on Delivery</strong><div class="inline-note" style="margin:2px 0 0">Payment is collected when your order arrives.</div></div></div><div class="order-summary"><p class="eyebrow">Order summary</p>${state.cart.map(x=>`<div class="summary-line"><span>${x.name} × ${x.qty}</span><strong>${money(x.price*x.qty)}</strong></div>`).join('')}<div class="summary-line" style="font-size:20px;margin-top:7px"><span>Total</span><strong>${money(cartTotal())}</strong></div></div><button class="primary-btn wide" data-place-order style="margin-top:18px">Confirm & Place Order <span>✓</span></button></div></section>`)}

async function placeOrder(){const name=document.getElementById('customerName')?.value.trim();const address=document.getElementById('customerAddress')?.value.trim();if(!name||name.length<2){alert('Please enter your name.');return}if(!address||address.length<5){alert('Please enter your complete delivery address.');return}const payload={name,address,phone:state.phone,language:state.language,paymentMethod:'COD',items:state.cart.map(x=>({id:x.id,qty:x.qty,price:x.price,extraCheese:x.extraCheese,isCombo:x.isCombo}))};const btn=document.querySelector('[data-place-order]');btn.disabled=true;btn.textContent='Placing order…';try{const r=await fetch('/api/order/place',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});const data=await r.json();if(!r.ok||!data.success)throw new Error(data.error||'Order failed');state.cart=[];saveCart();render(`<section class="success"><div class="success-card"><div class="success-icon">🎉</div><p class="eyebrow">Order confirmed</p><h1>Thank you!</h1><p style="color:var(--muted);line-height:1.7">Your order has been received by Town Pizza Planet. We’ll prepare it fresh and call if we need anything.</p><div class="order-id">${data.orderId}</div><p style="margin:18px 0 28px;font-size:20px"><strong>Total: ${money(data.total)}</strong><br><span style="color:var(--muted);font-size:14px">Cash on Delivery</span></p><button class="primary-btn" data-view="home">Back to Home</button></div></section>`)}catch(err){alert(err.message||'Could not place the order. Please try again.');btn.disabled=false;btn.textContent='Confirm & Place Order ✓'}}

function languageScreen(){render(`<section class="success" style="min-height:72vh"><div class="success-card" style="width:min(520px,100%)"><div style="font-size:58px">🌐</div><p class="eyebrow">Welcome</p><h1 style="font-size:42px;margin-top:8px">Choose Language</h1><p style="color:var(--muted)">Select your preferred language to start ordering.</p><div style="display:grid;gap:10px;margin-top:22px"><button class="primary-btn wide" data-lang="en">English</button><button class="primary-btn wide" data-lang="kn">ಕನ್ನಡ (Kannada)</button><button class="primary-btn wide" data-lang="hi">हिंदी (Hindi)</button><button class="primary-btn wide" data-lang="ur">اردو (Urdu)</button></div></div></section>`)}

app.addEventListener('click',(e)=>{const btn=e.target.closest('button');if(!btn)return;if(btn.hasAttribute('data-home')){home();return}if(btn.hasAttribute('data-cart')){openCart();return}if(btn.hasAttribute('data-close-cart')){closeCart();return}if(btn===scrim){closeCart();return}const view=btn.dataset.view;if(view){if(view==='home')home();else if(view==='bestsellers')bestsellers();else if(view==='menu'){state.view='menu';menu()}else if(view==='combos')packs('combo');else if(view==='family')packs('family');return}if(btn.dataset.category){state.category=btn.dataset.category;state.view='menu';menu();return}if(btn.dataset.add){addItem(btn.dataset.add,false); if(state.view==='menu')menu(); if(state.view==='bestsellers')bestsellers(); return}if(btn.dataset.addCheese){addItem(btn.dataset.addCheese,true); if(state.view==='menu')menu();return}if(btn.dataset.addPack){addPack(btn.dataset.addPack);return}if(btn.dataset.change){changeItem(btn.dataset.change,Number(btn.dataset.delta||0),false);return}if(btn.dataset.cartChange){const i=state.cart.findIndex(x=>x.key===btn.dataset.cartChange);if(i>=0){state.cart[i].qty+=Number(btn.dataset.delta||0);if(state.cart[i].qty<=0)state.cart.splice(i,1);saveCart();openCart()}return}if(btn.hasAttribute('data-checkout')){checkout();return}if(btn.hasAttribute('data-place-order')){placeOrder();return}if(btn.dataset.lang){state.language=btn.dataset.lang;home();return}});

document.querySelector('.cart-pill').addEventListener('click',openCart);scrim.addEventListener('click',closeCart);

async function init(){try{const r=await fetch('/api/order/catalog',{cache:'no-store'});const data=await r.json();if(!data.success)throw new Error('Catalog unavailable');state.catalog=data.catalog;updateCartBadge();languageScreen()}catch(err){render(`<div class="empty-state"><h2>Unable to load the menu</h2><p>${err.message}</p><button class="primary-btn" onclick="location.reload()">Try again</button></div>`)}}
init();
