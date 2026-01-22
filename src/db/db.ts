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

export interface Staff {
  id: number;
  businessId: number;
  name: string;
  role: 'ADMIN' | 'STAFF'; // For display purposes in local mode
  phone?: string;
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
  
  // Feature: Staff Tagging
  staffId?: number;
  
  // Feature: Inventory Link
  items?: { itemId: number; qty: number; price: number }[]; 
}

export const db = new Dexie('CashBookDB') as Dexie & {
  transactions: EntityTable<Transaction, 'id'>;
  categories: EntityTable<Category, 'id'>;
  businesses: EntityTable<Business, 'id'>;
  items: EntityTable<Item, 'id'>;
  parties: EntityTable<Party, 'id'>;
  staff: EntityTable<Staff, 'id'>;
};

// Schema
db.version(5).stores({
  transactions: '++id, businessId, date, type, category, dueDate, isCredit, partyId, staffId',
  categories: '++id, name, type',
  businesses: '++id, name',
  items: '++id, businessId, name, stock',
  parties: '++id, businessId, name, type',
  staff: '++id, businessId, name'
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
