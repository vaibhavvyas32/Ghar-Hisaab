// All app data lives in one object saved to the phone's localStorage.
//
// Shape:
// {
//   settings: { currency: '₹' },
//   milk: {
//     rate: 60, qty: 1,                       // price per litre, default litres per day
//     entries: { '2026-11-05': { s: 'y', qty: 1, rate: 60 } },   // s: 'y' delivered, 'n' not delivered
//     paid: { '2026-11': true },
//   },
//   dryclean / press: {
//     categories: [{ id, name, price }],
//     entries: { '2026-11-05': { s: 'y', items: { [catId]: { name, price, count } } } },
//     paid: { '2026-11': true },
//   },
// }

const KEY = 'daily-tracker-data-v1'

let idCounter = 0
export const newId = () => Date.now().toString(36) + (idCounter++).toString(36)

export const defaultData = {
  settings: { currency: '₹' },
  milk: { rate: 60, qty: 1, entries: {}, paid: {} },
  dryclean: {
    categories: [
      { id: 'dc1', name: 'Shirt', price: 60 },
      { id: 'dc2', name: 'Trousers / Jeans', price: 80 },
      { id: 'dc3', name: 'Saree', price: 150 },
      { id: 'dc4', name: 'Suit (2 pc)', price: 300 },
      { id: 'dc5', name: 'Jacket / Winter wear', price: 250 },
    ],
    entries: {},
    paid: {},
  },
  press: {
    categories: [
      { id: 'pr1', name: 'Shirt / T-shirt', price: 10 },
      { id: 'pr2', name: 'Trousers / Jeans', price: 12 },
      { id: 'pr3', name: 'Saree', price: 30 },
      { id: 'pr4', name: 'Kurta', price: 15 },
    ],
    entries: {},
    paid: {},
  },
}

// Fill in anything missing (e.g. data restored from an older backup).
export function withDefaults(raw) {
  const d = structuredClone(defaultData)
  if (!raw || typeof raw !== 'object') return d
  return {
    settings: { ...d.settings, ...raw.settings },
    milk: { ...d.milk, ...raw.milk },
    dryclean: { ...d.dryclean, ...raw.dryclean },
    press: { ...d.press, ...raw.press },
  }
}

export function loadData() {
  try {
    const raw = localStorage.getItem(KEY)
    return withDefaults(raw ? JSON.parse(raw) : null)
  } catch {
    return structuredClone(defaultData)
  }
}

export function saveData(data) {
  localStorage.setItem(KEY, JSON.stringify(data))
}

export function isValidBackup(obj) {
  return obj && typeof obj === 'object' && obj.milk && obj.dryclean && obj.press
}
