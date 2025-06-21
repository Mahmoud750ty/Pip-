// src/types/index.ts

export interface Product {
    id: string;
    name: string;
    price: number;
    imageUrl: string;
    is_available: boolean;
    is_visible: boolean;
    orderId: number;
    stock: number;
    createdAt: any;
    updatedAt: any;
}

export interface OrderItem {
    productId: string;
    name: string;
    price: number;
    quantity: number;
}

export interface Order {
    id: string;
    customerName: string;
    items: OrderItem[];
    total: number;
    createdAt: any;
    type: 'WhatsApp' | 'Cashier';
    cashierId?: string;
    cashierName?: string;
}