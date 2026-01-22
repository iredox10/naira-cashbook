import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { db, Business } from '../db/db';
import { useLiveQuery } from 'dexie-react-hooks';

interface BusinessContextType {
  currentBusiness: Business | undefined;
  switchBusiness: (id: number) => void;
  createBusiness: (name: string) => Promise<void>;
  businesses: Business[] | undefined;
}

const BusinessContext = createContext<BusinessContextType | undefined>(undefined);

export function BusinessProvider({ children }: { children: ReactNode }) {
  const [currentBusinessId, setCurrentBusinessId] = useState<number>(1);
  
  // Persist selection
  useEffect(() => {
    const saved = localStorage.getItem('currentBusinessId');
    if (saved) setCurrentBusinessId(parseInt(saved));
  }, []);

  const businesses = useLiveQuery(() => db.businesses.toArray());
  
  const currentBusiness = businesses?.find(b => b.id === currentBusinessId);

  const switchBusiness = (id: number) => {
    setCurrentBusinessId(id);
    localStorage.setItem('currentBusinessId', id.toString());
  };

  const createBusiness = async (name: string) => {
    await db.businesses.add({ name, currency: 'NGN' });
  };

  // Ensure at least one business exists and is selected
  useEffect(() => {
    if (businesses && businesses.length > 0 && !currentBusiness) {
       switchBusiness(businesses[0].id);
    }
  }, [businesses, currentBusiness]);

  return (
    <BusinessContext.Provider value={{ currentBusiness, switchBusiness, createBusiness, businesses }}>
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
