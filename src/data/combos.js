// Town Pizza Planet — authoritative combo menu

const combos = [
  {
    id: 'C1',
    name: 'Classic Cheesy Meal',
    price: 249,
    description: '1 Margherita Pizza + 1 Large Fries + 1 Cold Drink',
    notes: 'Choose an available cold drink.',
  },
  {
    id: 'C2',
    name: 'Desi Delight Solo',
    price: 299,
    description: '1 Sweet Corn OR Baby Corn Pizza + 1 Regular Fries + 1 Cold Drink',
    notes: 'Choose Sweet Corn or Baby Corn Pizza and an available cold drink.',
  },
  {
    id: 'C3',
    name: 'Family Choice Mix',
    price: 849,
    description: '1 Sweet Corn OR Baby Corn Pizza + 1 Chicken Pizza + 1 Sandwich + 1 Large Fries + 2 Cold Drinks',
    notes: 'Chicken Pizza means Peri Peri Chicken or Barbeque Chicken; choose your sandwich and drinks.',
    serves: '3–4',
  },
  {
    id: 'C4',
    name: 'The Hangout Special',
    price: 579,
    description: '2 Veg Burgers + 2 Shakes + 1 Large Fries',
    notes: 'Choose any two available shakes.',
    serves: '2–3',
  },
  {
    id: 'C5',
    name: 'Mexican Maha Combo',
    price: 899,
    description: '2 Mexican Pizzas + 2 Veg Burgers + 1 Large Fries + 2 Shakes',
    notes: 'Choose any two available shakes.',
    serves: '3–4',
  },
  {
    id: 'C6',
    name: 'Non-Veg Maharaja',
    price: 949,
    description: '2 Chicken Pizzas + 1 Chicken Burger + 1 Large Fries + 2 Cold Drinks',
    notes: 'Chicken Pizza means Peri Peri Chicken or Barbeque Chicken; choose your cold drinks.',
    serves: '3–4',
  },
  {
    id: 'C7',
    name: 'Pocket Friendly Veg Meal',
    price: 149,
    description: '1 Veg Burger + 1 Regular Fries + 1 Drink',
    notes: 'Choose an available drink.',
  },
  {
    id: 'C8',
    name: 'Quick Bite Non-Veg Meal',
    price: 209,
    description: '1 Non-Veg Burger + 1 Regular Fries + 1 Cold Drink',
    notes: 'Non-Veg Burger is Chicken Burger; choose an available cold drink.',
  },
  {
    id: 'C9',
    name: 'Veg Maharaja',
    price: 749,
    description: '1 Sweet Corn OR Baby Corn Pizza + 1 Paneer Pizza + 1 Sandwich + 1 Large Fries + 2 Cold Drinks',
    notes: 'Choose Sweet Corn or Baby Corn Pizza, a sandwich and cold drinks.',
    serves: '3–4',
  },
];

function normalize(value) {
  return String(value || '').toLowerCase().replace(/\s+/g, ' ').trim();
}

function findComboById(id) {
  return combos.find(c => c.id === String(id || '').toUpperCase()) || null;
}

function findComboByName(query) {
  const lower = normalize(query);
  return combos.find(c => normalize(c.name).includes(lower) || lower.includes(normalize(c.name))) || null;
}

module.exports = { combos, findComboById, findComboByName };
