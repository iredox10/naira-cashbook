import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { account } from '../lib/appwrite';
import { ID, type Models } from 'appwrite';

interface AuthContextType {
    user: Models.User<Models.Preferences> | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    signup: (email: string, password: string, name: string) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<Models.User<Models.Preferences> | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkUser();
    }, []);

    const checkUser = async () => {
        try {
            const session = await account.get();
            setUser(session);
        } catch (error) {
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async (email: string, password: string) => {
        await account.createEmailPasswordSession(email, password);
        const userAccount = await account.get();
        setUser(userAccount);
    };

    const signup = async (email: string, password: string, name: string) => {
        await account.create(ID.unique(), email, password, name);
        await login(email, password);
    };

    const logout = async () => {
        await account.deleteSession('current');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
