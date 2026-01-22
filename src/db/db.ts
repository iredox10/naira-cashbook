import Dexie, { type EntityTable } from 'dexie';

export interface Category {
  id: number;
  name: string;
  type: 'IN' | 'OUT' | 'BOTH';
}

export interface Business {
  id: number;
  name: string;
  currency: string;
}

export interface Item {
  id: number;
  businessId: number;
  name: string;
  price: number; // Selling price
  stock: number;
  minStock: number;
  unit: string; // e.g., kg, pcs, box
}

export interface Party {
  id: number;
  businessId: number;
  name: string;
  phone: string;
  type: 'CUSTOMER' | 'SUPPLIER';
}

export interface Transaction {
  id: number;
  businessId: number;
  amount: number;
  type: 'IN' | 'OUT';
  category: string;
  remark: string;
  date: Date;
  paymentMode: string;
  
  // Feature 6: Promise to Pay
  dueDate?: Date;
  isCredit?: boolean;
  partyName?: string; // Legacy string field
  
  // Feature: Party Ledger
  partyId?: number;
  
  // Feature: Inventory Link (Simple: one item per transaction for now, or multiple via JSON in remark if needed, but let's do direct link)
  // For a full POS system, we'd need a separate TransactionItems table, but for "CashBook",
  // usually it's "Sold 5 items". Let's stick to simple single-line item or just tracking value.
  // Actually, to support inventory deduction, we need to know what was sold.
  // Let's add an optional items array
  items?: { itemId: number; qty: number; price: number }[]; 
}

export const db = new Dexie('CashBookDB') as Dexie & {
  transactions: EntityTable<Transaction, 'id'>;
  categories: EntityTable<Category, 'id'>;
  businesses: EntityTable<Business, 'id'>;
  items: EntityTable<Item, 'id'>;
  parties: EntityTable<Party, 'id'>;
};

// Schema
db.version(4).stores({
  transactions: '++id, businessId, date, type, category, dueDate, isCredit, partyId',
  categories: '++id, name, type',
  businesses: '++id, name',
  items: '++id, businessId, name, stock', // Indexed by stock for low stock queries
  parties: '++id, businessId, name, type'
});

export const DEFAULT_CATEGORIES = [
  'Sales', 'Food', 'Transport', 'Rent', 'Salary', 'Utilities', 'Other'
];

// Initialize Defaults
db.on('populate', () => {
  db.categories.bulkAdd([
    { name: 'Sales', type: 'IN' },
    { name: 'Food', type: 'OUT' },
    { name: 'Transport', type: 'OUT' },
    { name: 'Rent', type: 'OUT' },
    { name: 'Salary', type: 'OUT' },
    { name: 'Utilities', type: 'OUT' },
    { name: 'Other', type: 'BOTH' }
  ]);
  
  db.businesses.add({
    name: 'Shop #1',
    currency: 'NGN'
  });
});

// Backward compatibility helper
export const CATEGORIES = DEFAULT_CATEGORIES;
