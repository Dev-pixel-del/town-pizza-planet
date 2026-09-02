// Town Pizza Planet — Family Packs.
// Kept separate from regular Combo Deals.
// Images live in public/family-packs/ and are named F1.jpg ... F4.jpg.

const familyPacks = [
  {
    id: 'F1',
    name: 'Family Choice Mix',
    description: '1 Sweet Corn OR Baby Corn Pizza + 1 Chicken Pizza + Any 1 Sandwich + 1 Large Fries + 2 Cold Drinks',
    items: ['1x Sweet Corn/Baby Corn Pizza', '1x Chicken Pizza', '1x Any Sandwich', '1x French Fries (Large)', '2x Cold Drinks'],
    price: 849,
    image: 'F1.jpg',
  },
  {
    id: 'F2',
    name: 'Mexican Maha Combo',
    description: '2 Mexican Pizzas + 2 Veg Burgers + 1 Large Fries + 2 Shakes',
    items: ['2x Mexican Pizza', '2x Veg Burger', '1x French Fries (Large)', '2x Any Shake'],
    price: 899,
    image: 'F2.jpg',
  },
  {
    id: 'F3',
    name: 'Non-Veg Maharaja',
    description: '2 Chicken Pizzas + 1 Chicken Burger + 1 Large Fries + 2 Cold Drinks',
    items: ['2x Chicken Pizza', '1x Chicken Burger', '1x French Fries (Large)', '2x Cold Drinks'],
    price: 949,
    image: 'F3.jpg',
  },
  {
    id: 'F4',
    name: 'Veg Maharaja',
    description: '1 Sweet Corn OR Baby Corn Pizza + 1 Paneer Pizza + Any 1 Sandwich + 1 Large Fries + 2 Cold Drinks',
    items: ['1x Sweet Corn/Baby Corn Pizza', '1x Paneer Pizza', '1x Any Sandwich', '1x French Fries (Large)', '2x Cold Drinks'],
    price: 749,
    image: 'F4.jpg',
  },
];

function findFamilyPackById(id) {
  const key = String(id || '').trim().toUpperCase();
  return familyPacks.find(p => p.id === key) || null;
}

function findFamilyPackByName(query) {
  const q = String(query || '').trim().toLowerCase();
  if (!q) return null;
  return familyPacks.find(p => p.name.toLowerCase().includes(q)) || null;
}

module.exports = { familyPacks, findFamilyPackById, findFamilyPackByName };
