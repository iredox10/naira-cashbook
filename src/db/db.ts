import Dexie, { type EntityTable } from 'dexie';

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
  partyName?: string; // Simplification: store name directly for now
}

// ... (Category interface)

export interface Business {
  id: number;
  name: string;
  currency: string;
}

export const db = new Dexie('CashBookDB') as Dexie & {
  transactions: EntityTable<Transaction, 'id'>;
  categories: EntityTable<Category, 'id'>;
  businesses: EntityTable<Business, 'id'>;
};

// Schema
db.version(3).stores({
  transactions: '++id, businessId, date, type, category, dueDate, isCredit',
  categories: '++id, name, type',
  businesses: '++id, name'
});

// ... (Defaults)

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
