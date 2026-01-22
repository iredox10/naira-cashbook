import Dexie, { type EntityTable } from 'dexie';

export interface Transaction {
  id: number;
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

export const db = new Dexie('CashBookDB') as Dexie & {
  transactions: EntityTable<Transaction, 'id'>;
};

// Schema
db.version(1).stores({
  transactions: '++id, date, type, category, dueDate, isCredit'
});

export const CATEGORIES = [
  'Sales', 'Food', 'Transport', 'Rent', 'Salary', 'Utilities', 'Other'
];
