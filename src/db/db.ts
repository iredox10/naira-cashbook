import Dexie, { type EntityTable } from 'dexie';

export interface Category {
  id?: number;
  businessId: number;
  name: string;
  type: 'IN' | 'OUT' | 'BOTH';
  remoteId?: string;
}

export interface Business {
  id?: number;
  name: string;
  currency: string;
  logo?: string;
  remoteId?: string;
}

export interface Transaction {
  id?: number;
  businessId: number;
  amount: number;
  type: 'IN' | 'OUT';
  category: string;
  remark: string;
  date: Date;
  isCredit: boolean;
  dueDate?: Date;
  partyId?: number;
  staffId?: number;
  itemId?: number;
  paymentMode: 'Cash' | 'Bank' | 'Online' | 'Credit';
  receiptImage?: Blob | string;
  remoteId?: string;
}

export interface Item {
  id?: number;
  businessId: number;
  name: string;
  stock: number;
  price: number;
  costPrice?: number;
  remoteId?: string;
}

export interface Party {
  id?: number;
  businessId: number;
  name: string;
  phone?: string;
  type: 'Customer' | 'Supplier';
  remoteId?: string;
}

export interface Staff {
  id?: number;
  businessId: number;
  name: string;
  phone?: string;
  role: 'Admin' | 'Operator';
  salary?: number;
  remoteId?: string;
}

export interface BusinessSettings {
  id?: number;
  businessId: number;
  backupEnabled: boolean;
  lastBackupDate?: Date;
  privacyEnabled: boolean;
  remoteId?: string;
}

const db = new Dexie('CashBookDB') as Dexie & {
  transactions: EntityTable<Transaction, 'id'>;
  categories: EntityTable<Category, 'id'>;
  businesses: EntityTable<Business, 'id'>;
  items: EntityTable<Item, 'id'>;
  parties: EntityTable<Party, 'id'>;
  staff: EntityTable<Staff, 'id'>;
  settings: EntityTable<BusinessSettings, 'id'>;
};

// Schema
db.version(8).stores({
  transactions: '++id, businessId, date, type, category, dueDate, isCredit, partyId, staffId, paymentMode, remoteId',
  categories: '++id, businessId, name, type, remoteId',
  businesses: '++id, name, remoteId',
  items: '++id, businessId, name, stock, remoteId',
  parties: '++id, businessId, name, type, remoteId',
  staff: '++id, businessId, name, role, remoteId',
  settings: '++id, businessId, remoteId'
});

// Initialize Defaults
db.on('populate', () => {
  db.categories.bulkAdd([
    { name: 'Sales', type: 'IN', businessId: 1 },
    { name: 'Food', type: 'OUT', businessId: 1 },
    { name: 'Transport', type: 'OUT', businessId: 1 },
    { name: 'Rent', type: 'OUT', businessId: 1 },
    { name: 'Salary', type: 'OUT', businessId: 1 },
    { name: 'Utilities', type: 'OUT', businessId: 1 },
    { name: 'Other', type: 'BOTH', businessId: 1 }
  ]);

  db.businesses.add({
    name: 'Shop #1',
    currency: 'NGN'
  });

  db.settings.add({
    businessId: 1,
    backupEnabled: false,
    privacyEnabled: false
  });
});

export { db };
export const DEFAULT_CATEGORIES = [
  'Sales', 'Food', 'Transport', 'Rent', 'Salary', 'Utilities', 'Other'
];
export const CATEGORIES = DEFAULT_CATEGORIES;
