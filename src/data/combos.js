// Town Pizza Planet — final regular Combo Deals.
// Images live in public/combo-images/ and are named C1.jpg ... C11.jpg.

const combos = [
  {
    id: 'C1',
    name: 'Pocket Friendly Veg Meal',
    description: '1 Veg Burger + 1 Regular Fries + 1 Drink',
    items: ['1x Veg Burger', '1x French Fries (Regular)', '1x Drink'],
    price: 149,
    image: 'C1.jpg',
  },
  {
    id: 'C2',
    name: 'Quick Bite Non-Veg Meal',
    description: '1 Chicken Burger + 1 Regular Fries + 1 Cold Drink',
    items: ['1x Chicken Burger', '1x French Fries (Regular)', '1x Cold Drink'],
    price: 209,
    image: 'C2.jpg',
  },
  {
    id: 'C3',
    name: 'Classic Cheesy Meal',
    description: '1 Margherita Pizza + 1 Large Fries + 1 Cold Drink',
    items: ['1x Margherita Pizza', '1x French Fries (Large)', '1x Cold Drink'],
    price: 249,
    image: 'C3.jpg',
  },
  {
    id: 'C4',
    name: 'Desi Delight Solo',
    description: '1 Sweet Corn OR Baby Corn Pizza + 1 Regular Fries + 1 Cold Drink',
    items: ['1x Sweet Corn/Baby Corn Pizza', '1x French Fries (Regular)', '1x Cold Drink'],
    price: 299,
    image: 'C4.jpg',
  },
  {
    id: 'C5',
    name: 'The Hangout Special',
    description: '2 Veg Burgers + 2 Shakes + 1 Large Fries',
    items: ['2x Veg Burger', '2x Any Shake', '1x French Fries (Large)'],
    price: 579,
    image: 'C5.jpg',
  },
  {
    id: 'C6',
    name: 'Mexican Fiesta Solo',
    description: '1 Mexican Pizza + 1 Regular Fries + Any 1 Shake',
    items: ['1x Mexican Pizza', '1x French Fries (Regular)', '1x Any Shake'],
    price: 489,
    image: 'C6.jpg',
  },
  {
    id: 'C7',
    name: 'Veg Burger Combo',
    description: '2 Veg Burgers + 1 Regular Fries + 1 Drink',
    items: ['2x Veg Burger', '1x French Fries (Regular)', '1x Drink'],
    price: 249,
    image: 'C7.jpg',
  },
  {
    id: 'C8',
    name: 'Chicken Feast Royale',
    description: '1 Chicken Pizza + 2 Veg Burgers + 1 Large Fries + Any 1 Shake',
    items: ['1x Chicken Pizza', '2x Veg Burger', '1x French Fries (Large)', '1x Any Shake'],
    price: 799,
    image: 'C8.jpg',
  },
  {
    id: 'C9',
    name: 'Baby Corn Burger Blast',
    description: '1 Baby Corn Pizza + 2 Veg Burgers + 1 Regular Fries + 1 Coke',
    items: ['1x Baby Corn Pizza', '2x Veg Burger', '1x French Fries (Regular)', '1x Coke'],
    price: 499,
    image: 'C9.jpg',
  },
  {
    id: 'C10',
    name: 'Mexican Veggie Feast',
    description: '1 Mexican Pizza + Any 2 Veg Sandwiches + 1 Regular Fries + 1 Coke',
    items: ['1x Mexican Pizza', '2x Any Veg Sandwiches', '1x French Fries (Regular)', '1x Coke'],
    price: 449,
    image: 'C10.jpg',
  },
  {
    id: 'C11',
    name: 'Chicken Burger Double Delight',
    description: '2 Chicken Burgers + Any 2 Sandwiches + 1 Regular Fries + 1 Coke',
    items: ['2x Chicken Burger', '2x Any Sandwiches', '1x French Fries (Regular)', '1x Coke'],
    price: 639,
    image: 'C11.jpg',
  },
];

function findComboById(id) {
  const key = String(id || '').trim().toUpperCase();
  return combos.find(c => c.id === key) || null;
}

function findComboByName(query) {
  const q = String(query || '').trim().toLowerCase();
  if (!q) return null;
  return combos.find(c => c.name.toLowerCase().includes(q)) || null;
}

module.exports = { combos, findComboById, findComboByName };
