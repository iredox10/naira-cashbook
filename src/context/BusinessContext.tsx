import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { db, type Business } from '../db/db';
import { useLiveQuery } from 'dexie-react-hooks';

interface BusinessContextType {
  currentBusiness: Business | undefined;
  switchBusiness: (id: number) => void;
  createBusiness: (name: string) => Promise<void>;
  businesses: Business[] | undefined;
  userRole: 'Admin' | 'Operator';
  switchRole: (role: 'Admin' | 'Operator') => void;
}

const BusinessContext = createContext<BusinessContextType | undefined>(undefined);

export function BusinessProvider({ children }: { children: ReactNode }) {
  const [currentBusinessId, setCurrentBusinessId] = useState<number>(1);
  const [userRole, setUserRole] = useState<'Admin' | 'Operator'>('Admin');

  // Persist selection
  useEffect(() => {
    const savedId = localStorage.getItem('currentBusinessId');
    if (savedId) setCurrentBusinessId(parseInt(savedId));

    const savedRole = localStorage.getItem('userRole');
    if (savedRole === 'Admin' || savedRole === 'Operator') setUserRole(savedRole);
  }, []);

  const switchRole = (role: 'Admin' | 'Operator') => {
    setUserRole(role);
    localStorage.setItem('userRole', role);
  };

  const businesses = useLiveQuery(() => db.businesses.toArray());

  const currentBusiness = businesses?.find(b => b.id === currentBusinessId);

  const switchBusiness = (id: number) => {
    setCurrentBusinessId(id);
    localStorage.setItem('currentBusinessId', id.toString());
  };

  const createBusiness = async (name: string) => {
    await db.transaction('rw', db.businesses, db.categories, async () => {
      const id = await db.businesses.add({ name, currency: 'NGN' });
      // Add default categories for this new business
      const defaults = [
        { name: 'Sales', type: 'IN', businessId: id },
        { name: 'Food', type: 'OUT', businessId: id },
        { name: 'Transport', type: 'OUT', businessId: id },
        { name: 'Rent', type: 'OUT', businessId: id },
        { name: 'Salary', type: 'OUT', businessId: id },
        { name: 'Utilities', type: 'OUT', businessId: id },
        { name: 'Other', type: 'BOTH', businessId: id }
      ];
      await db.categories.bulkAdd(defaults as any);
    });
  };

  // Ensure at least one business exists and is selected
  useEffect(() => {
    if (businesses && businesses.length > 0 && !currentBusiness) {
      if (businesses[0].id) switchBusiness(businesses[0].id);
    }
  }, [businesses, currentBusiness]);

  return (
    <BusinessContext.Provider value={{ currentBusiness, switchBusiness, createBusiness, businesses, userRole, switchRole }}>
      {children}
    </BusinessContext.Provider>
  );
}

export function useBusiness() {
  const context = useContext(BusinessContext);
  if (context === undefined) {
    throw new Error('useBusiness must be used within a BusinessProvider');
  }
  return context;
}
