// Notice the 'import type' syntax here
import React, { createContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react'; // <-- FIX 1
import { onAuthStateChanged } from 'firebase/auth';
import type { User } from 'firebase/auth'; // <-- FIX 2
import { auth } from '../lib/firebase';

// The interface definition remains the same
interface AuthContextType {
    currentUser: User | null;
    loading: boolean;
}

// The ESLint warning points here, but it's a very common pattern.
// We are creating a context object, which is not a component.
export const AuthContext = createContext<AuthContextType>({
    currentUser: null,
    loading: true,
});

// The interface for our component's props also uses a type
interface AuthProviderProps {
    children: ReactNode;
}

// This is our actual component, which is correctly exported.
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const value = {
        currentUser,
        loading,
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};