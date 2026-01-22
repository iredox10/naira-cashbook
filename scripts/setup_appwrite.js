import { Client, Databases, Storage, ID, Permission, Role } from 'node-appwrite';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

const client = new Client();
client
    .setEndpoint(process.env.VITE_APPWRITE_ENDPOINT)
    .setProject(process.env.VITE_APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);
const storage = new Storage(client);

const DB_ID = 'cashbook_db';
const DB_NAME = 'CashBook Database';
const BUCKET_ID = 'receipts';

async function setup() {
    try {
        console.log('🚀 Starting Appwrite Setup...');

        // 1. Create Database
        try {
            await databases.create(DB_ID, DB_NAME);
            console.log('✅ Database created');
        } catch (e) {
            console.log('ℹ️ Database already exists');
        }

        // 2. Create Storage Bucket
        try {
            await storage.createBucket(
                BUCKET_ID,
                'Transaction Receipts',
                [
                    Permission.read(Role.users()),
                    Permission.create(Role.users()),
                    Permission.update(Role.users()),
                    Permission.delete(Role.users()),
                ],
                false, // fileSecurity
                true,  // enabled
                undefined, // maximumFileSize
                ['jpg', 'png', 'jpeg', 'pdf', 'webp'] // allowedExtensions
            );
            console.log('✅ Storage Bucket created');
        } catch (e) {
            console.log('ℹ️ Storage Bucket already exists');
        }

        const collections = [
            {
                id: 'transactions',
                name: 'Transactions',
                attributes: [
                    { key: 'userId', type: 'string', size: 36, required: true },
                    { key: 'businessId', type: 'integer', required: true },
                    { key: 'amount', type: 'double', required: true },
                    { key: 'type', type: 'string', size: 10, required: true }, // IN, OUT
                    { key: 'category', type: 'string', size: 50, required: true },
                    { key: 'remark', type: 'string', size: 255, required: false },
                    { key: 'date', type: 'datetime', required: true },
                    { key: 'isCredit', type: 'boolean', required: true },
                    { key: 'dueDate', type: 'datetime', required: false },
                    { key: 'partyId', type: 'integer', required: false },
                    { key: 'staffId', type: 'integer', required: false },
                    { key: 'itemId', type: 'integer', required: false },
                    { key: 'paymentMode', type: 'string', size: 20, required: true },
                    { key: 'receiptImage', type: 'string', size: 255, required: false }, // Store ID
                ]
            },
            {
                id: 'categories',
                name: 'Categories',
                attributes: [
                    { key: 'userId', type: 'string', size: 36, required: true },
                    { key: 'businessId', type: 'integer', required: true },
                    { key: 'name', type: 'string', size: 50, required: true },
                    { key: 'type', type: 'string', size: 10, required: true },
                ]
            },
            {
                id: 'businesses',
                name: 'Businesses',
                attributes: [
                    { key: 'userId', type: 'string', size: 36, required: true },
                    { key: 'name', type: 'string', size: 100, required: true },
                    { key: 'currency', type: 'string', size: 10, required: true },
                    { key: 'logo', type: 'string', size: 255, required: false },
                ]
            },
            {
                id: 'items',
                name: 'Items',
                attributes: [
                    { key: 'userId', type: 'string', size: 36, required: true },
                    { key: 'businessId', type: 'integer', required: true },
                    { key: 'name', type: 'string', size: 100, required: true },
                    { key: 'stock', type: 'integer', required: true },
                    { key: 'price', type: 'double', required: true },
                    { key: 'costPrice', type: 'double', required: false },
                ]
            },
            {
                id: 'parties',
                name: 'Parties',
                attributes: [
                    { key: 'userId', type: 'string', size: 36, required: true },
                    { key: 'businessId', type: 'integer', required: true },
                    { key: 'name', type: 'string', size: 100, required: true },
                    { key: 'phone', type: 'string', size: 20, required: false },
                    { key: 'type', type: 'string', size: 20, required: true }, // Customer, Supplier
                ]
            },
            {
                id: 'staff',
                name: 'Staff',
                attributes: [
                    { key: 'userId', type: 'string', size: 36, required: true },
                    { key: 'businessId', type: 'integer', required: true },
                    { key: 'name', type: 'string', size: 100, required: true },
                    { key: 'phone', type: 'string', size: 20, required: false },
                    { key: 'role', type: 'string', size: 20, required: true },
                    { key: 'salary', type: 'double', required: false },
                ]
            },
            {
                id: 'settings',
                name: 'Settings',
                attributes: [
                    { key: 'userId', type: 'string', size: 36, required: true },
                    { key: 'businessId', type: 'integer', required: true },
                    { key: 'backupEnabled', type: 'boolean', required: true },
                    { key: 'lastBackupDate', type: 'datetime', required: false },
                    { key: 'privacyEnabled', type: 'boolean', required: true },
                ]
            }
        ];

        for (const col of collections) {
            try {
                // Create Collection
                await databases.createCollection(
                    DB_ID,
                    col.id,
                    col.name,
                    [
                        Permission.read(Role.users()),
                        Permission.create(Role.users()),
                        Permission.update(Role.users()),
                        Permission.delete(Role.users()),
                    ]
                );
                console.log(`✅ Collection "${col.name}" created`);

                // Add Attributes
                for (const attr of col.attributes) {
                    try {
                        if (attr.type === 'string') {
                            await databases.createStringAttribute(DB_ID, col.id, attr.key, attr.size, attr.required);
                        } else if (attr.type === 'integer') {
                            await databases.createIntegerAttribute(DB_ID, col.id, attr.key, attr.required);
                        } else if (attr.type === 'double') {
                            await databases.createFloatAttribute(DB_ID, col.id, attr.key, attr.required);
                        } else if (attr.type === 'boolean') {
                            await databases.createBooleanAttribute(DB_ID, col.id, attr.key, attr.required);
                        } else if (attr.type === 'datetime') {
                            await databases.createDatetimeAttribute(DB_ID, col.id, attr.key, attr.required);
                        }
                        console.log(`   🔸 Attribute "${attr.key}" added`);
                    } catch (e) {
                        console.log(`   ⚠️ Attribute "${attr.key}" error: ${e.message}`);
                    }
                }

                // Add index for userId to speed up queries
                try {
                    await databases.createIndex(DB_ID, col.id, 'user_index', 'key', ['userId']);
                    console.log(`   🔹 Index "user_index" added`);
                } catch (e) {
                    console.log(`   ⚠️ Index error: ${e.message}`);
                }

            } catch (e) {
                console.log(`ℹ️ Collection "${col.name}" already exists or error: ${e.message}`);
            }
        }

        console.log('\n✨ Appwrite Setup Complete!');

    } catch (error) {
        console.error('❌ Setup failed:', error);
    }
}

setup();
