import { createContext, useState, useContext, type ReactNode } from 'react';
// Assuming your Product type is in a central types file
import { type Product } from '../types';

// --- TYPE DEFINITIONS ---

// The shape of a cart item (product + quantity)
// This should be the single source of truth for a cart item's structure.
// NOTE: I've standardized to use 'name' and 'price' to avoid confusion
// between 'product_name'/'price_consumer' and 'name'/'price'.
// Your ProductCard should be updated to match this.
export interface CartItem extends Product {
    quantity: number;
    collectionName: string;
}

// Define the shape of the context value, including new functions
interface CartContextType {
    cartItems: CartItem[];
    addToCart: (product: Product) => void;
    decreaseQuantity: (productId: string) => void; // NEW
    removeFromCart: (productId: string) => void;   // NEW
    clearCart: () => void;
    getCartTotal: () => number;
    getCartItemCount: () => number;
}

// --- CONTEXT CREATION ---

const CartContext = createContext<CartContextType | undefined>(undefined);

// --- PROVIDER COMPONENT ---

export const CartProvider = ({ children }: { children: ReactNode }) => {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);

    // This function can now be used to add a new item or increment an existing one
    const addToCart = (product: Product & { collectionName?: string }) => {
        setCartItems(prevItems => {
            const existingItem = prevItems.find(item => item.id === product.id);
            if (existingItem) {
                return prevItems.map(item =>
                    item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
                );
            }
            // Add new item to cart with quantity 1 and collectionName
            const newCartItem: CartItem = { ...product, quantity: 1, collectionName: product.collectionName || '' };
            return [...prevItems, newCartItem];
        });
    };

    // NEW: Function to decrease item quantity or remove if it's the last one
    const decreaseQuantity = (productId: string) => {
        setCartItems(prevItems => {
            const existingItem = prevItems.find(item => item.id === productId);
            if (existingItem && existingItem.quantity > 1) {
                // If quantity > 1, just decrease it
                return prevItems.map(item =>
                    item.id === productId ? { ...item, quantity: item.quantity - 1 } : item
                );
            }
            // If quantity is 1 (or less, as a fallback), remove the item from the cart
            return prevItems.filter(item => item.id !== productId);
        });
    };

    // NEW: Function to completely remove an item regardless of quantity
    const removeFromCart = (productId: string) => {
        setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
    };

    const clearCart = () => {
        setCartItems([]);
    };

    const getCartTotal = () => {
        // FIXED: Using item.price consistently, as defined in the Product/CartItem type.
        return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    const getCartItemCount = () => {
        return cartItems.reduce((count, item) => count + item.quantity, 0);
    };

    // Provide the new functions in the context value
    const contextValue = {
        cartItems,
        addToCart,
        decreaseQuantity,
        removeFromCart,
        clearCart,
        getCartTotal,
        getCartItemCount
    };

    return (
        <CartContext.Provider value={contextValue}>
            {children}
        </CartContext.Provider>
    );
};

// --- CUSTOM HOOK ---

export const useCart = () => {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};