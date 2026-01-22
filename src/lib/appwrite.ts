import { Client, Account, Databases, Storage } from 'appwrite';

const client = new Client();

client
    .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT)
    .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID);

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

export const DB_ID = 'cashbook_db';
export const COLLECTIONS = {
    TRANSACTIONS: 'transactions',
    CATEGORIES: 'categories',
    BUSINESSES: 'businesses',
    ITEMS: 'items',
    PARTIES: 'parties',
    STAFF: 'staff',
    SETTINGS: 'settings'
};

export { client };
