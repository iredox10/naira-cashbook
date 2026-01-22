import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { db } from '../db/db';
import { databases, DB_ID, COLLECTIONS, storage } from '../lib/appwrite';
import { useAuth } from './AuthContext';
import { Query, ID } from 'appwrite';

interface SyncContextType {
    isSyncing: boolean;
    lastSynced: Date | null;
    sync: () => Promise<void>;
}

const SyncContext = createContext<SyncContextType | undefined>(undefined);

export function SyncProvider({ children }: { children: ReactNode }) {
    const [isSyncing, setIsSyncing] = useState(false);
    const [lastSynced, setLastSynced] = useState<Date | null>(null);
    const { user } = useAuth();

    useEffect(() => {
        if (user) {
            sync(); // Initial sync on load
        }

        const handleOnline = () => {
            console.log('🌐 Internet restored! Triggering sync...');
            sync();
        };

        window.addEventListener('online', handleOnline);
        return () => window.removeEventListener('online', handleOnline);
    }, [user]);

    const sync = async () => {
        if (!user || isSyncing) return;
        setIsSyncing(true);

        try {
            console.log('🔄 Starting Sync...');

            const tables = [
                { name: 'businesses', col: COLLECTIONS.BUSINESSES },
                { name: 'categories', col: COLLECTIONS.CATEGORIES },
                { name: 'parties', col: COLLECTIONS.PARTIES },
                { name: 'items', col: COLLECTIONS.ITEMS },
                { name: 'staff', col: COLLECTIONS.STAFF },
                { name: 'transactions', col: COLLECTIONS.TRANSACTIONS },
                { name: 'settings', col: COLLECTIONS.SETTINGS },
            ];

            for (const table of tables) {
                // 1. PUSH local changes to cloud
                const localRecords = await (db as any)[table.name].toArray();
                for (const record of localRecords) {
                    const data = { ...record, userId: user.$id };
                    delete data.id; // Dexie internal ID
                    delete data.remoteId; // Do not send remoteId back to Appwrite, it generates its own $id

                    // --- Handle Image Upload for Transactions ---
                    if (table.name === 'transactions' && record.receiptImage instanceof Blob) {
                        try {
                            const file = await storage.createFile(
                                'receipts',
                                ID.unique(),
                                record.receiptImage
                            );
                            data.receiptImage = file.$id;
                            // Update local Dexie with the file ID string so we don't re-upload
                            await db.transactions.update(record.id!, { receiptImage: file.$id });
                        } catch (e) {
                            console.error('Image upload failed:', e);
                            delete data.receiptImage;
                        }
                    }

                    // Format dates for Appwrite (datetime attributes expect strings or Date objects)
                    if (data.date) data.date = new Date(data.date);
                    if (data.dueDate) data.dueDate = new Date(data.dueDate);
                    if (data.lastBackupDate) data.lastBackupDate = new Date(data.lastBackupDate);

                    try {
                        if (record.remoteId) {
                            // Update existing
                            await databases.updateDocument(DB_ID, table.col, record.remoteId, data);
                        } else {
                            // Create new
                            const doc = await databases.createDocument(DB_ID, table.col, ID.unique(), data);
                            await (db as any)[table.name].update(record.id, { remoteId: doc.$id });
                        }
                    } catch (e) {
                        console.error(`Error syncing ${table.name} record:`, e);
                    }
                }

                // 2. PULL remote changes from cloud
                const remoteDocs = await databases.listDocuments(DB_ID, table.col, [
                    Query.equal('userId', user.$id)
                ]);

                for (const doc of remoteDocs.documents) {
                    const existing = await (db as any)[table.name].where('remoteId').equals(doc.$id).first();

                    const localData = { ...doc };
                    delete (localData as any).$id;
                    delete (localData as any).$collectionId;
                    delete (localData as any).$databaseId;
                    delete (localData as any).$createdAt;
                    delete (localData as any).$updatedAt;
                    delete (localData as any).$permissions;
                    delete (localData as any).userId;
                    (localData as any).remoteId = doc.$id;

                    if (!existing) {
                        await (db as any)[table.name].add(localData);
                    } else {
                        await (db as any)[table.name].update(existing.id, localData);
                    }
                }
            }

            setLastSynced(new Date());
            console.log('✅ Sync Finished');
        } catch (error) {
            console.error('❌ Sync Failed:', error);
            alert('Sync failed. Please check your connection.');
        } finally {
            setIsSyncing(false);
        }
    };

    return (
        <SyncContext.Provider value={{ isSyncing, lastSynced, sync }}>
            {children}
        </SyncContext.Provider>
    );
}

export function useSync() {
    const context = useContext(SyncContext);
    if (context === undefined) {
        throw new Error('useSync must be used within a SyncProvider');
    }
    return context;
}
