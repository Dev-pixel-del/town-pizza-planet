const {
  categories,
  bestsellers,
  findItemById,
  getFinalPrice,
  EXTRA_CHEESE_PRICE,
} = require('../data/menu');
const { combos } = require('../data/combos');
const { familyPacks } = require('../data/familyPacks');

function itemView(item) {
  return {
    id: item.id,
    name: item.name,
    price: Number(getFinalPrice(item)),
    image: item.image,
    category: item.category || null,
    extraCheese: item.id.startsWith('P'),
  };
}

function categoryView(category) {
  return {
    key: category.key,
    name: category.name,
    emoji: category.emoji,
    items: category.items.map(itemView),
  };
}

function packView(pack) {
  return {
    id: pack.id,
    name: pack.name,
    description: pack.description,
    items: pack.items,
    price: Number(pack.price),
    image: pack.image,
  };
}

function getCatalog() {
  return {
    storeName: process.env.STORE_NAME || 'Town Pizza Planet',
    phone: [process.env.STORE_PHONE, '9448769098', '6362648283'].filter(Boolean).filter((v, i, a) => a.indexOf(v) === i),
    extraCheesePrice: EXTRA_CHEESE_PRICE,
    bestsellers: bestsellers.map(findItemById).filter(Boolean).map(itemView),
    categories: categories.map(categoryView),
    combos: combos.map(packView),
    familyPacks: familyPacks.map(packView),
  };
}

module.exports = { getCatalog };
